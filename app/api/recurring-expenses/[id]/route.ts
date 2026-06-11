/**
 * app/api/recurring-expenses/[id]/route.ts
 *
 * GET    /api/recurring-expenses/:id — Get recurring expense detail
 * PUT    /api/recurring-expenses/:id — Update template fields
 * DELETE /api/recurring-expenses/:id — Deactivate the recurring expense
 */

import { NextRequest } from 'next/server';
import {
  getRecurringExpenseById,
  updateRecurringExpense,
  deactivateRecurringExpense,
} from '@/services/recurring-expense.service';
import { updateRecurringExpenseSchema } from '@/lib/validations/recurring-expense.validation';
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
    const recurring = await getRecurringExpenseById(id);

    if (!recurring) {
      return notFoundResponse('Recurring expense not found');
    }

    return successResponse(recurring);
  } catch (error) {
    console.error('Recurring expense GET error:', error);
    return serverErrorResponse();
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateRecurringExpenseSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Validation failed', 400, parsed.error.issues);
    }

    const existing = await getRecurringExpenseById(id);
    if (!existing) {
      return notFoundResponse('Recurring expense not found');
    }

    const updated = await updateRecurringExpense(id, parsed.data);
    return successResponse(updated);
  } catch (error) {
    console.error('Recurring expense PUT error:', error);
    return serverErrorResponse();
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const existing = await getRecurringExpenseById(id);
    if (!existing) {
      return notFoundResponse('Recurring expense not found');
    }

    const result = await deactivateRecurringExpense(id);
    return successResponse(result);
  } catch (error) {
    console.error('Recurring expense DELETE error:', error);
    return serverErrorResponse();
  }
}
