/**
 * services/expense.service.ts
 *
 * Application logic for expenses (movements).
 * Handles CRUD, filtering, and monthly aggregation.
 */

import { prisma } from '@/lib/prisma';
import type { ExpenseSource } from '@/generated/client/client';

interface ExpenseFilters {
  year?: number;
  month?: number;
  categoryId?: string;
  source?: ExpenseSource;
}

/**
 * Builds a date range for a given year/month.
 * From the 1st day 00:00:00 to the last day 23:59:59.
 */
function buildMonthDateRange(year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  return { startDate, endDate };
}

export async function getExpenses(filters?: ExpenseFilters) {
  const where: Record<string, unknown> = {};

  if (filters?.year && filters?.month) {
    const { startDate, endDate } = buildMonthDateRange(filters.year, filters.month);
    where.date = { gte: startDate, lte: endDate };
  } else if (filters?.year) {
    const startDate = new Date(filters.year, 0, 1);
    const endDate = new Date(filters.year, 11, 31, 23, 59, 59, 999);
    where.date = { gte: startDate, lte: endDate };
  }

  if (filters?.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters?.source) {
    where.source = filters.source;
  }

  return prisma.expense.findMany({
    where,
    include: { category: true },
    orderBy: { date: 'desc' },
  });
}

export async function getExpenseById(id: string) {
  return prisma.expense.findUnique({
    where: { id },
    include: { category: true },
  });
}

export async function createExpense(data: {
  description: string;
  amount: number;
  date: Date;
  categoryId: string;
  notes?: string | null;
  source?: ExpenseSource;
  recurringExpenseId?: string | null;
}) {
  return prisma.expense.create({
    data: {
      description: data.description,
      amount: data.amount,
      date: data.date,
      categoryId: data.categoryId,
      notes: data.notes,
      source: data.source ?? 'MANUAL',
      recurringExpenseId: data.recurringExpenseId,
    },
    include: { category: true },
  });
}

export async function updateExpense(
  id: string,
  data: {
    description?: string;
    amount?: number;
    date?: Date;
    categoryId?: string;
    notes?: string | null;
  }
) {
  return prisma.expense.update({
    where: { id },
    data,
    include: { category: true },
  });
}

export async function deleteExpense(id: string) {
  return prisma.expense.delete({
    where: { id },
  });
}

/**
 * Returns expense totals grouped by category for a given month.
 * Uses two queries: groupBy for sums + categories for names.
 */
export async function getMonthlyTotalByCategory(year: number, month: number) {
  const { startDate, endDate } = buildMonthDateRange(year, month);

  const grouped = await prisma.expense.groupBy({
    by: ['categoryId'],
    where: {
      date: { gte: startDate, lte: endDate },
    },
    _sum: { amount: true },
  });

  if (grouped.length === 0) return [];

  // Fetch category names
  const categoryIds = grouped.map((g) => g.categoryId);
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true },
  });

  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  return grouped.map((g) => ({
    categoryId: g.categoryId,
    categoryName: categoryMap.get(g.categoryId) ?? 'Unknown',
    amount: g._sum.amount ?? 0,
  }));
}

/**
 * Returns the total sum of all expenses for a given month.
 */
export async function getMonthlyTotal(year: number, month: number) {
  const { startDate, endDate } = buildMonthDateRange(year, month);

  const result = await prisma.expense.aggregate({
    where: {
      date: { gte: startDate, lte: endDate },
    },
    _sum: { amount: true },
  });

  return result._sum.amount ?? 0;
}
