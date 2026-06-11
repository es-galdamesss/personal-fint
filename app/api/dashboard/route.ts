/**
 * app/api/dashboard/route.ts
 *
 * GET /api/dashboard?year=YYYY&month=MM
 * Returns aggregated dashboard data for the given month.
 */

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getDashboardData } from '@/services/dashboard.service';
import { successResponse, errorResponse, serverErrorResponse } from '@/lib/api-response';

const querySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  month: z.coerce.number().int().min(1).max(12),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parsed = querySchema.safeParse({
      year: searchParams.get('year'),
      month: searchParams.get('month'),
    });

    if (!parsed.success) {
      return errorResponse('Invalid query parameters', 400, parsed.error.issues);
    }

    const { year, month } = parsed.data;
    const data = await getDashboardData(year, month);

    return successResponse(data);
  } catch (error) {
    console.error('Dashboard GET error:', error);
    return serverErrorResponse();
  }
}
