/**
 * services/category-limit.service.ts
 *
 * Application logic for category limits within a monthly budget.
 */

import { prisma } from '@/lib/prisma';

export async function getLimitsByBudgetId(budgetId: string) {
  return prisma.categoryLimit.findMany({
    where: { budgetId },
    include: { category: true },
    orderBy: { category: { name: 'asc' } },
  });
}

export async function upsertCategoryLimit(
  budgetId: string,
  categoryId: string,
  amount: number
) {
  return prisma.categoryLimit.upsert({
    where: {
      budgetId_categoryId: { budgetId, categoryId },
    },
    create: { budgetId, categoryId, amount },
    update: { amount },
    include: { category: true },
  });
}

export async function deleteCategoryLimit(id: string) {
  return prisma.categoryLimit.delete({
    where: { id },
  });
}
