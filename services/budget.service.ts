/**
 * services/budget.service.ts
 *
 * Application logic for monthly budgets.
 * Uses Prisma Client for database access.
 */

import { prisma } from '@/lib/prisma';

export async function getBudgets() {
  return prisma.monthlyBudget.findMany({
    orderBy: [{ year: 'desc' }, { month: 'desc' }],
    include: {
      categoryLimits: {
        include: { category: true },
      },
    },
  });
}

export async function getBudgetByYearMonth(year: number, month: number) {
  return prisma.monthlyBudget.findUnique({
    where: { year_month: { year, month } },
    include: {
      categoryLimits: {
        include: { category: true },
      },
    },
  });
}

export async function getBudgetById(id: string) {
  return prisma.monthlyBudget.findUnique({
    where: { id },
    include: {
      categoryLimits: {
        include: { category: true },
      },
    },
  });
}

export async function upsertBudget(year: number, month: number, amount: number) {
  return prisma.monthlyBudget.upsert({
    where: { year_month: { year, month } },
    create: { year, month, amount },
    update: { amount },
    include: {
      categoryLimits: {
        include: { category: true },
      },
    },
  });
}

export async function deleteBudget(id: string) {
  return prisma.monthlyBudget.delete({
    where: { id },
  });
}
