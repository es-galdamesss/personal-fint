/**
 * app/api/recurring-expenses/route.ts
 *
 * GET  /api/recurring-expenses — List recurring expenses
 * POST /api/recurring-expenses — Create a recurring expense template (creates first real expense too)
 */

import { NextRequest } from 'next/server';
import {
  getRecurringExpenses,
  createRecurringExpense,
} from '@/services/recurring-expense.service';
import { createRecurringExpenseSchema } from '@/lib/validations/recurring-expense.validation';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const activeOnly = request.nextUrl.searchParams.get('activeOnly') !== 'false';
    const recurring = await getRecurringExpenses(activeOnly);
    return successResponse(recurring);
  } catch (error) {
    console.error('Recurring expenses GET error:', error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createRecurringExpenseSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Validation failed', 400, parsed.error.issues);
    }

    const recurring = await createRecurringExpense({
      description: parsed.data.description,
      defaultAmount: parsed.data.defaultAmount,
      startDate: new Date(parsed.data.startDate),
      chargeDay: parsed.data.chargeDay,
      categoryId: parsed.data.categoryId,
      notes: parsed.data.notes,
    });

    return successResponse(recurring, 201);
  } catch (error) {
    console.error('Recurring expense POST error:', error);
    return serverErrorResponse();
  }
}
