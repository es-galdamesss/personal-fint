/**
 * app/api/movements/[id]/route.ts
 *
 * GET    /api/movements/:id — Get single expense
 * PUT    /api/movements/:id — Update expense
 * DELETE /api/movements/:id — Delete expense
 */

import { NextRequest } from 'next/server';
import {
  getExpenseById,
  updateExpense,
  deleteExpense,
} from '@/services/expense.service';
import { updateExpenseSchema } from '@/lib/validations/expense.validation';
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
    const expense = await getExpenseById(id);

    if (!expense) {
      return notFoundResponse('Expense not found');
    }

    return successResponse(expense);
  } catch (error) {
    console.error('Movement GET error:', error);
    return serverErrorResponse();
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateExpenseSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Validation failed', 400, parsed.error.issues);
    }

    const existing = await getExpenseById(id);
    if (!existing) {
      return notFoundResponse('Expense not found');
    }

    const updateData = {
      ...parsed.data,
      date: parsed.data.date ? new Date(parsed.data.date) : undefined,
    };

    const expense = await updateExpense(id, updateData);
    return successResponse(expense);
  } catch (error) {
    console.error('Movement PUT error:', error);
    return serverErrorResponse();
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const existing = await getExpenseById(id);
    if (!existing) {
      return notFoundResponse('Expense not found');
    }

    await deleteExpense(id);
    return successResponse({ deleted: true });
  } catch (error) {
    console.error('Movement DELETE error:', error);
    return serverErrorResponse();
  }
}
