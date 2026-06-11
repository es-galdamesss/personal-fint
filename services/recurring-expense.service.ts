/**
 * services/recurring-expense.service.ts
 *
 * Application logic for recurring expense templates, overrides,
 * and the MVP auto-charge mechanism.
 */

import { prisma } from '@/lib/prisma';
import {
  resolveRecurringExpense,
  type RecurringExpense as DomainRecurringExpense,
  type RecurringExpenseOverride as DomainOverride,
} from '@/domain/recurring-expense';
import type { RecurringOverrideStatus } from '@/generated/client/client';

export async function getRecurringExpenses(activeOnly = true) {
  return prisma.recurringExpense.findMany({
    where: activeOnly ? { isActive: true } : {},
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getRecurringExpenseById(id: string) {
  return prisma.recurringExpense.findUnique({
    where: { id },
    include: {
      category: true,
      overrides: { orderBy: [{ year: 'desc' }, { month: 'desc' }] },
    },
  });
}

export async function createRecurringExpense(data: {
  description: string;
  defaultAmount: number;
  startDate: Date;
  chargeDay: number;
  categoryId: string;
  notes?: string | null;
}) {
  // Use a transaction to create the template and its first real expense
  return prisma.$transaction(async (tx) => {
    // 1. Create the recurring expense template
    const recurring = await tx.recurringExpense.create({
      data: {
        description: data.description,
        defaultAmount: data.defaultAmount,
        startDate: data.startDate,
        chargeDay: data.chargeDay,
        categoryId: data.categoryId,
        notes: data.notes,
      },
      include: { category: true },
    });

    // 2. Create the first real expense for the start month (source=RECURRING)
    const startMonth = data.startDate.getMonth() + 1; // 1-indexed
    const startYear = data.startDate.getFullYear();

    // Calculate the actual charge date for the start month
    const maxDays = new Date(startYear, startMonth, 0).getDate();
    const actualDay = Math.min(data.chargeDay, maxDays);
    const chargeDate = new Date(startYear, startMonth - 1, actualDay);

    await tx.expense.create({
      data: {
        description: data.description,
        amount: data.defaultAmount,
        date: chargeDate,
        categoryId: data.categoryId,
        notes: data.notes,
        source: 'RECURRING',
        recurringExpenseId: recurring.id,
      },
    });

    return recurring;
  });
}

export async function updateRecurringExpense(
  id: string,
  data: {
    description?: string;
    defaultAmount?: number;
    chargeDay?: number;
    categoryId?: string;
    notes?: string | null;
    isActive?: boolean;
  }
) {
  return prisma.recurringExpense.update({
    where: { id },
    data,
    include: { category: true },
  });
}

export async function deactivateRecurringExpense(id: string) {
  return prisma.recurringExpense.update({
    where: { id },
    data: { isActive: false },
    include: { category: true },
  });
}

export async function getOverrides(
  recurringExpenseId: string,
  year?: number,
  month?: number
) {
  const where: Record<string, unknown> = { recurringExpenseId };
  if (year !== undefined) where.year = year;
  if (month !== undefined) where.month = month;

  return prisma.recurringExpenseOverride.findMany({
    where,
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
  });
}

export async function createOverride(
  recurringExpenseId: string,
  data: {
    year: number;
    month: number;
    status: RecurringOverrideStatus;
    customAmount?: number | null;
  }
) {
  return prisma.recurringExpenseOverride.upsert({
    where: {
      recurringExpenseId_year_month: {
        recurringExpenseId,
        year: data.year,
        month: data.month,
      },
    },
    create: {
      recurringExpenseId,
      year: data.year,
      month: data.month,
      status: data.status,
      customAmount: data.customAmount,
    },
    update: {
      status: data.status,
      customAmount: data.customAmount,
    },
  });
}

/**
 * MVP auto-charge: processes all due recurring expenses for a given year/month.
 * Uses domain/recurring-expense.ts resolveRecurringExpense() for state resolution.
 * Runs when the user opens the dashboard or movement history.
 * Returns the count of newly created expenses.
 */
export async function processDueRecurringExpenses(year: number, month: number) {
  // 1. Fetch all active recurring expenses
  const recurringExpenses = await prisma.recurringExpense.findMany({
    where: { isActive: true },
  });

  if (recurringExpenses.length === 0) return 0;

  // 2. Fetch all overrides for this year/month
  const overrides = await prisma.recurringExpenseOverride.findMany({
    where: { year, month },
  });

  // 3. Map to domain types
  const domainOverrides: DomainOverride[] = overrides.map((o) => ({
    id: o.id,
    recurringExpenseId: o.recurringExpenseId,
    year: o.year,
    month: o.month,
    status: o.status,
    customAmount: o.customAmount,
  }));

  let createdCount = 0;

  for (const re of recurringExpenses) {
    // Map Prisma model to domain type
    const domainExpense: DomainRecurringExpense = {
      id: re.id,
      description: re.description,
      defaultAmount: re.defaultAmount,
      startDate: re.startDate,
      chargeDay: re.chargeDay,
      isActive: re.isActive,
      categoryId: re.categoryId,
      notes: re.notes,
    };

    // 4. Resolve using domain function
    const resolved = resolveRecurringExpense(domainExpense, domainOverrides, year, month);

    // Skip if null (inactive, not started) or cancelled
    if (!resolved || resolved.isCancelled) continue;

    // 5. Check if a real expense already exists for this recurring + date
    const existing = await prisma.expense.findUnique({
      where: {
        recurringExpenseId_date: {
          recurringExpenseId: re.id,
          date: resolved.chargeDate,
        },
      },
    });

    if (existing) continue;

    // 6. Create the real expense
    await prisma.expense.create({
      data: {
        description: resolved.description,
        amount: resolved.amount,
        date: resolved.chargeDate,
        categoryId: resolved.categoryId,
        notes: resolved.notes,
        source: 'RECURRING',
        recurringExpenseId: re.id,
      },
    });

    createdCount++;
  }

  return createdCount;
}
