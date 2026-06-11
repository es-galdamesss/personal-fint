/**
 * services/category.service.ts
 *
 * Application logic for expense categories.
 * Handles CRUD with soft-delete for categories with history.
 */

import { prisma } from '@/lib/prisma';

/**
 * Generates a URL-safe slug from a category name.
 * Lowercases, strips diacritics, replaces non-alphanumeric with hyphens.
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-|-$/g, ''); // trim leading/trailing hyphens
}

export async function getCategories(includeInactive = false) {
  return prisma.category.findMany({
    where: includeInactive ? {} : { isActive: true },
    orderBy: { name: 'asc' },
  });
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({
    where: { id },
  });
}

export async function createCategory(data: {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}) {
  const slug = generateSlug(data.name);

  // Check for duplicate slug
  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) {
    throw new Error(`A category with slug "${slug}" already exists`);
  }

  return prisma.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description,
      color: data.color,
      icon: data.icon,
    },
  });
}

export async function updateCategory(
  id: string,
  data: {
    name?: string;
    description?: string | null;
    color?: string | null;
    icon?: string | null;
  }
) {
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
    const slug = generateSlug(data.name);

    // Check for duplicate slug (exclude self)
    const existing = await prisma.category.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      throw new Error(`A category with slug "${slug}" already exists`);
    }
    updateData.slug = slug;
  }

  if (data.description !== undefined) updateData.description = data.description;
  if (data.color !== undefined) updateData.color = data.color;
  if (data.icon !== undefined) updateData.icon = data.icon;

  return prisma.category.update({
    where: { id },
    data: updateData,
  });
}

export async function deleteCategory(id: string) {
  // Check if category has any expenses or recurring expenses
  const [expenseCount, recurringCount] = await Promise.all([
    prisma.expense.count({ where: { categoryId: id } }),
    prisma.recurringExpense.count({ where: { categoryId: id } }),
  ]);

  if (expenseCount > 0 || recurringCount > 0) {
    // Soft-delete: set isActive = false
    return prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }

  // No history: physically delete
  return prisma.category.delete({
    where: { id },
  });
}
