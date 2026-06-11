/**
 * app/api/budgets/route.ts
 *
 * GET  /api/budgets — List all budgets
 * POST /api/budgets — Create/upsert a budget
 */

import { NextRequest } from 'next/server';
import { getBudgets, upsertBudget } from '@/services/budget.service';
import { createBudgetSchema } from '@/lib/validations/budget.validation';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response';

export async function GET() {
  try {
    const budgets = await getBudgets();
    return successResponse(budgets);
  } catch (error) {
    console.error('Budgets GET error:', error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createBudgetSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Validation failed', 400, parsed.error.issues);
    }

    const { year, month, amount } = parsed.data;
    const budget = await upsertBudget(year, month, amount);

    return successResponse(budget, 201);
  } catch (error) {
    console.error('Budgets POST error:', error);
    return serverErrorResponse();
  }
}
