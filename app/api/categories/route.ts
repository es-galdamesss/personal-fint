/**
 * app/api/categories/route.ts
 *
 * GET  /api/categories — List categories
 * POST /api/categories — Create a new category
 */

import { NextRequest } from 'next/server';
import {
  getCategories,
  createCategory,
} from '@/services/category.service';
import { createCategorySchema } from '@/lib/validations/category.validation';
import {
  successResponse,
  errorResponse,
  serverErrorResponse,
} from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const includeInactive =
      request.nextUrl.searchParams.get('includeInactive') === 'true';
    const categories = await getCategories(includeInactive);
    return successResponse(categories);
  } catch (error) {
    console.error('Categories GET error:', error);
    return serverErrorResponse();
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createCategorySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Validation failed', 400, parsed.error.issues);
    }

    const category = await createCategory(parsed.data);
    return successResponse(category, 201);
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      return errorResponse(error.message, 409);
    }
    console.error('Categories POST error:', error);
    return serverErrorResponse();
  }
}
