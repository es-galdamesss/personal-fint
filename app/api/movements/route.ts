/**
 * app/api/movements/route.ts
 *
 * GET  /api/movements — List/filter expenses
 * POST /api/movements — Create a new expense
 */

import { NextRequest } from 'next/server';
import { getExpenses, createExpense } from '@/services/expense.service';
import {
  createRecurringExpense,
} from '@/services/recurring-expense.service';
import {
  expenseFilterSchema,
  createExpenseSchema,
} from '@/lib/validations/expense.validation';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parsed = expenseFilterSchema.safeParse({
      year: searchParams.get('year') ?? undefined,
      month: searchParams.get('month') ?? undefined,
      categoryId: searchParams.get('categoryId') ?? undefined,
      source: searchParams.get('source') ?? undefined,
    });

    if (!parsed.success) {
      return errorResponse('Invalid filter parameters', 400, parsed.error.issues);
    }

    const expenses = await getExpenses(parsed.data);
    return successResponse(expenses);
  } catch (error) {
    console.error('Movements GET error:', error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createExpenseSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Validation failed', 400, parsed.error.issues);
    }

    const { isRecurring, ...expenseData } = parsed.data;

    if (isRecurring) {
      // Create a recurring expense template + first real expense
      const startDate = new Date(expenseData.date);
      const recurring = await createRecurringExpense({
        description: expenseData.description,
        defaultAmount: expenseData.amount,
        startDate,
        chargeDay: startDate.getDate(),
        categoryId: expenseData.categoryId,
        notes: expenseData.notes,
      });
      return successResponse(recurring, 201);
    }

    // Create a normal (manual) expense
    const expense = await createExpense({
      ...expenseData,
      date: new Date(expenseData.date),
    });

    return successResponse(expense, 201);
  } catch (error) {
    console.error('Movements POST error:', error);
    return serverErrorResponse();
  }
}
