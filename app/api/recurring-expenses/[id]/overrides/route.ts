/**
 * app/api/recurring-expenses/[id]/overrides/route.ts
 *
 * GET  /api/recurring-expenses/:id/overrides — Get overrides for a recurring expense
 * POST /api/recurring-expenses/:id/overrides — Create/upsert a monthly override
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  getRecurringExpenseById,
  getOverrides,
  createOverride,
} from '@/services/recurring-expense.service';
import { createOverrideSchema } from '@/lib/validations/recurring-expense.validation';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  serverErrorResponse,
} from '@/lib/api-response';

type RouteParams = { params: Promise<{ id: string }> };

const filterQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
});

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: recurringExpenseId } = await params;
    const recurring = await getRecurringExpenseById(recurringExpenseId);

    if (!recurring) {
      return notFoundResponse('Recurring expense not found');
    }

    const searchParams = request.nextUrl.searchParams;
    const parsed = filterQuerySchema.safeParse({
      year: searchParams.get('year') ?? undefined,
      month: searchParams.get('month') ?? undefined,
    });

    if (!parsed.success) {
      return errorResponse('Invalid filter parameters', 400, parsed.error.issues);
    }

    const overrides = await getOverrides(
      recurringExpenseId,
      parsed.data.year,
      parsed.data.month
    );

    return successResponse(overrides);
  } catch (error) {
    console.error('Overrides GET error:', error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: recurringExpenseId } = await params;
    const recurring = await getRecurringExpenseById(recurringExpenseId);

    if (!recurring) {
      return notFoundResponse('Recurring expense not found');
    }

    const body = await request.json();
    const parsed = createOverrideSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Validation failed', 400, parsed.error.issues);
    }

    const override = await createOverride(recurringExpenseId, parsed.data);
    return successResponse(override, 201);
  } catch (error) {
    console.error('Override POST error:', error);
    return serverErrorResponse();
  }
}
