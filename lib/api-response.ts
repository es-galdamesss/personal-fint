import { NextResponse } from 'next/server';

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function successResponse<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(error: string, status = 400, details?: unknown): NextResponse<ApiErrorResponse> {
  return NextResponse.json({ success: false, error, ...(details !== undefined && { details }) }, { status });
}

export function notFoundResponse(message = 'Resource not found'): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 404);
}

export function serverErrorResponse(message = 'Internal server error'): NextResponse<ApiErrorResponse> {
  return errorResponse(message, 500);
}
