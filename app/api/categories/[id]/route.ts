/**
 * app/api/categories/[id]/route.ts
 *
 * GET    /api/categories/:id — Get single category
 * PUT    /api/categories/:id — Update category
 * DELETE /api/categories/:id — Soft-delete or delete category
 */

import { NextRequest } from 'next/server';
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
} from '@/services/category.service';
import { updateCategorySchema } from '@/lib/validations/category.validation';
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
    const category = await getCategoryById(id);

    if (!category) {
      return notFoundResponse('Category not found');
    }

    return successResponse(category);
  } catch (error) {
    console.error('Category GET error:', error);
    return serverErrorResponse();
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = updateCategorySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Validation failed', 400, parsed.error.issues);
    }

    const existing = await getCategoryById(id);
    if (!existing) {
      return notFoundResponse('Category not found');
    }

    const category = await updateCategory(id, parsed.data);
    return successResponse(category);
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      return errorResponse(error.message, 409);
    }
    console.error('Category PUT error:', error);
    return serverErrorResponse();
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const existing = await getCategoryById(id);
    if (!existing) {
      return notFoundResponse('Category not found');
    }

    const result = await deleteCategory(id);
    return successResponse(result);
  } catch (error) {
    console.error('Category DELETE error:', error);
    return serverErrorResponse();
  }
}
