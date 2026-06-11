/**
 * app/api/budgets/[id]/limits/[limitId]/route.ts
 *
 * PUT    /api/budgets/:id/limits/:limitId — Update a category limit amount
 * DELETE /api/budgets/:id/limits/:limitId — Delete a category limit
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { deleteCategoryLimit } from '@/services/category-limit.service';
import { updateCategoryLimitSchema } from '@/lib/validations/category-limit.validation';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api-response';

type RouteParams = { params: Promise<{ id: string; limitId: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: budgetId, limitId } = await params;
    const body = await request.json();
    const parsed = updateCategoryLimitSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Validation failed', 400, parsed.error.issues);
    }

    const existing = await prisma.categoryLimit.findUnique({
      where: { id: limitId },
    });

    if (!existing || existing.budgetId !== budgetId) {
      return notFoundResponse('Category limit not found for this budget');
    }

    const updated = await prisma.categoryLimit.update({
      where: { id: limitId },
      data: { amount: parsed.data.amount },
      include: { category: true },
    });

    return successResponse(updated);
  } catch (error) {
    console.error('Category limit PUT error:', error);
    return serverErrorResponse();
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id: budgetId, limitId } = await params;
    const existing = await prisma.categoryLimit.findUnique({
      where: { id: limitId },
    });

    if (!existing || existing.budgetId !== budgetId) {
      return notFoundResponse('Category limit not found for this budget');
    }

    await deleteCategoryLimit(limitId);
    return successResponse({ deleted: true });
  } catch (error) {
    console.error('Category limit DELETE error:', error);
    return serverErrorResponse();
  }
}
