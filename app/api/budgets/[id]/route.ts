/**
 * app/api/budgets/[id]/route.ts
 *
 * GET    /api/budgets/:id — Get a budget by ID (includes limits)
 * PUT    /api/budgets/:id — Update a budget's amount
 * DELETE /api/budgets/:id — Delete a budget
 */

import { NextRequest } from 'next/server';
import { getBudgetById, upsertBudget, deleteBudget } from '@/services/budget.service';
import { updateBudgetSchema } from '@/lib/validations/budget.validation';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api-response';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const budget = await getBudgetById(id);

    if (!budget) {
      return notFoundResponse('Budget not found');
    }

    return successResponse(budget);
  } catch (error) {
    console.error('Budget GET error:', error);
    return serverErrorResponse();
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateBudgetSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Validation failed', 400, parsed.error.issues);
    }

    const existing = await getBudgetById(id);
    if (!existing) {
      return notFoundResponse('Budget not found');
    }

    // Since we have the ID and year/month from the existing budget, we can upsert
    const budget = await upsertBudget(existing.year, existing.month, parsed.data.amount);
    return successResponse(budget);
  } catch (error) {
    console.error('Budget PUT error:', error);
    return serverErrorResponse();
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const existing = await getBudgetById(id);
    if (!existing) {
      return notFoundResponse('Budget not found');
    }

    await deleteBudget(id);
    return successResponse({ deleted: true });
  } catch (error) {
    console.error('Budget DELETE error:', error);
    return serverErrorResponse();
  }
}
