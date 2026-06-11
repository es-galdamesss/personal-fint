/**
 * services/dashboard.service.ts
 *
 * Orchestrates all data needed for the dashboard view.
 * Delegates calculations to domain functions — does not duplicate business logic.
 */

import { prisma } from '@/lib/prisma';
import { calculateBudgetUsage } from '@/domain/budget';
import {
  calculateTrafficLight,
  calculateCategoryTrafficLight,
  type TrafficLightStatus,
  type CategoryTrafficLightStatus,
} from '@/domain/traffic-light';
import {
  calculateMonthlyComparison,
  type CategorySpending,
  type MonthlyComparisonResult,
} from '@/domain/monthly-comparison';
import {
  resolveRecurringExpense,
  type RecurringExpense as DomainRecurringExpense,
  type RecurringExpenseOverride as DomainOverride,
} from '@/domain/recurring-expense';
import { getMonthlyTotal, getMonthlyTotalByCategory } from '@/services/expense.service';
import { processDueRecurringExpenses } from '@/services/recurring-expense.service';

export interface DashboardCategoryData {
  categoryId: string;
  categoryName: string;
  spent: number;
  limit: number | null;
  usagePercentage: number | null;
  trafficLight: CategoryTrafficLightStatus;
}

export interface PendingRecurringExpense {
  recurringExpenseId: string;
  description: string;
  amount: number;
  chargeDate: Date;
  isCancelled: boolean;
}

export interface DashboardData {
  budget: { year: number; month: number; amount: number } | null;
  totalUsed: number;
  availableMoney: number;
  usagePercentage: number;
  trafficLight: TrafficLightStatus;
  categories: DashboardCategoryData[];
  highestSpendingCategory: {
    categoryId: string;
    categoryName: string;
    amount: number;
  } | null;
  pendingRecurringExpenses: PendingRecurringExpense[];
  monthlyComparison: MonthlyComparisonResult;
}

/**
 * Calculates the previous month's year/month pair.
 */
function getPreviousMonth(year: number, month: number) {
  if (month === 1) {
    return { year: year - 1, month: 12 };
  }
  return { year, month: month - 1 };
}

/**
 * Calculates the next month's year/month pair.
 */
function getNextMonth(year: number, month: number) {
  if (month === 12) {
    return { year: year + 1, month: 1 };
  }
  return { year, month: month + 1 };
}

export async function getDashboardData(
  year: number,
  month: number
): Promise<DashboardData> {
  // 1. Process due recurring expenses for the current month (MVP auto-charge)
  await processDueRecurringExpenses(year, month);

  // 2. Get budget for the month
  const budget = await prisma.monthlyBudget.findUnique({
    where: { year_month: { year, month } },
    include: {
      categoryLimits: {
        include: { category: true },
      },
    },
  });

  // 3. Get total expenses and expenses by category for the current month
  const [totalUsed, categorySpending] = await Promise.all([
    getMonthlyTotal(year, month),
    getMonthlyTotalByCategory(year, month),
  ]);

  // 4. Calculate budget usage using domain function
  const budgetAmount = budget?.amount ?? 0;
  const { availableMoney, usagePercentage } = calculateBudgetUsage(
    totalUsed,
    budgetAmount
  );
  const trafficLight = budgetAmount > 0
    ? calculateTrafficLight(usagePercentage)
    : ('GREEN' as TrafficLightStatus);

  // 5. Build category limits map
  const limitsMap = new Map<string, number>();
  if (budget?.categoryLimits) {
    for (const cl of budget.categoryLimits) {
      limitsMap.set(cl.categoryId, cl.amount);
    }
  }

  // 6. Build category data with traffic lights
  const categories: DashboardCategoryData[] = categorySpending.map((cs) => {
    const limit = limitsMap.get(cs.categoryId) ?? null;
    let catUsagePercentage: number | null = null;

    if (limit !== null && limit > 0) {
      catUsagePercentage =
        Math.round(((cs.amount / limit) * 100) * 100) / 100;
    }

    return {
      categoryId: cs.categoryId,
      categoryName: cs.categoryName,
      spent: cs.amount,
      limit,
      usagePercentage: catUsagePercentage,
      trafficLight: calculateCategoryTrafficLight(cs.amount, limit),
    };
  });

  // 7. Find highest spending category
  let highestSpendingCategory: DashboardData['highestSpendingCategory'] = null;
  if (categorySpending.length > 0) {
    const highest = categorySpending.reduce((max, cs) =>
      cs.amount > max.amount ? cs : max
    );
    highestSpendingCategory = {
      categoryId: highest.categoryId,
      categoryName: highest.categoryName,
      amount: highest.amount,
    };
  }

  // 8. Get pending recurring expenses for NEXT month
  const nextMonth = getNextMonth(year, month);
  const pendingRecurringExpenses = await getPendingRecurringForMonth(
    nextMonth.year,
    nextMonth.month
  );

  // 9. Monthly comparison: current month vs previous month
  const prevMonth = getPreviousMonth(year, month);
  const prevCategorySpending = await getMonthlyTotalByCategory(
    prevMonth.year,
    prevMonth.month
  );

  const currentSpending: CategorySpending[] = categorySpending.map((cs) => ({
    categoryId: cs.categoryId,
    categoryName: cs.categoryName,
    amount: cs.amount,
  }));

  const previousSpending: CategorySpending[] = prevCategorySpending.map((cs) => ({
    categoryId: cs.categoryId,
    categoryName: cs.categoryName,
    amount: cs.amount,
  }));

  const monthlyComparison = calculateMonthlyComparison(
    currentSpending,
    previousSpending
  );

  return {
    budget: budget
      ? { year: budget.year, month: budget.month, amount: budget.amount }
      : null,
    totalUsed,
    availableMoney,
    usagePercentage,
    trafficLight,
    categories,
    highestSpendingCategory,
    pendingRecurringExpenses,
    monthlyComparison,
  };
}

/**
 * Gets pending recurring expenses for a specific month.
 * These are active recurring expenses that have not yet been charged.
 */
async function getPendingRecurringForMonth(
  year: number,
  month: number
): Promise<PendingRecurringExpense[]> {
  const recurringExpenses = await prisma.recurringExpense.findMany({
    where: { isActive: true },
  });

  if (recurringExpenses.length === 0) return [];

  const overrides = await prisma.recurringExpenseOverride.findMany({
    where: { year, month },
  });

  const domainOverrides: DomainOverride[] = overrides.map((o) => ({
    id: o.id,
    recurringExpenseId: o.recurringExpenseId,
    year: o.year,
    month: o.month,
    status: o.status,
    customAmount: o.customAmount,
  }));

  const pending: PendingRecurringExpense[] = [];

  for (const re of recurringExpenses) {
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

    const resolved = resolveRecurringExpense(
      domainExpense,
      domainOverrides,
      year,
      month
    );

    if (!resolved) continue;

    pending.push({
      recurringExpenseId: resolved.recurringExpenseId,
      description: resolved.description,
      amount: resolved.amount,
      chargeDate: resolved.chargeDate,
      isCancelled: resolved.isCancelled,
    });
  }

  return pending;
}
