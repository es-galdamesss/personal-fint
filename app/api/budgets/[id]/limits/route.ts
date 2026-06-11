/**
 * app/api/budgets/[id]/limits/route.ts
 *
 * GET  /api/budgets/:id/limits — Get all category limits for a budget
 * POST /api/budgets/:id/limits — Create or update a category limit for a budget
 */

import { NextRequest } from 'next/server';
import { getBudgetById } from '@/services/budget.service';
import { getLimitsByBudgetId, upsertCategoryLimit } from '@/services/category-limit.service';
import { createCategoryLimitSchema } from '@/lib/validations/category-limit.validation';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api-response';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id: budgetId } = await params;
    const budget = await getBudgetById(budgetId);

    if (!budget) {
      return notFoundResponse('Budget not found');
    }

    const limits = await getLimitsByBudgetId(budgetId);
    return successResponse(limits);
  } catch (error) {
    console.error('Category limits GET error:', error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: budgetId } = await params;
    const budget = await getBudgetById(budgetId);

    if (!budget) {
      return notFoundResponse('Budget not found');
    }

    const body = await request.json();
    const parsed = createCategoryLimitSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Validation failed', 400, parsed.error.issues);
    }

    const { categoryId, amount } = parsed.data;
    const limit = await upsertCategoryLimit(budgetId, categoryId, amount);

    return successResponse(limit, 201);
  } catch (error) {
    console.error('Category limit POST error:', error);
    return serverErrorResponse();
  }
}
