
import { z } from 'zod';
import { NextResponse } from 'next/server';
import { ApiResponse } from '@/lib/responseHandler';

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  response?: NextResponse<ApiResponse>;
}

/**
 * Validate incoming request body against a Zod schema
 */
export async function validateRequest<T>(
  req: Request,
  schema: z.ZodType<T, any, any>
): Promise<ValidationResult<T>> {
  try {
    const data = await req.json();

    const result = schema.safeParse(data);

    if (!result.success) {
      const errors = result.error.issues.map((err: z.ZodIssue) => ({
        field: err.path.join('.') || 'unknown',
        message: err.message,
        code: err.code,
      }));

      const errorResponse: ApiResponse = {
        success: false,
        message: 'Validation Error',
        error: {
          code: 'VALIDATION_ERROR',
          details: { errors },
        },
        timestamp: new Date().toISOString(),
      };

      return {
        success: false,
        response: NextResponse.json(errorResponse, { status: 400 }),
      };
    }

    return {
      success: true,
      data: result.data,
    };
  } catch (error) {
    const errorResponse: ApiResponse = {
      success: false,
      message: 'Invalid JSON',
      error: {
        code: 'INVALID_JSON',
        details: { message: 'Request body must be valid JSON' },
      },
      timestamp: new Date().toISOString(),
    };

    return {
      success: false,
      response: NextResponse.json(errorResponse, { status: 400 }),
    };
  }
}

/**
 * Validate data object (not from request)
 */
export function validateData<T>(
  data: unknown,
  schema: z.ZodType<T, any, any>
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map((err: z.ZodIssue) => ({
      field: err.path.join('.') || 'unknown',
      message: err.message,
      code: err.code,
    }));

    const errorResponse: ApiResponse = {
      success: false,
      message: 'Validation Error',
      error: {
        code: 'VALIDATION_ERROR',
        details: { errors },
      },
      timestamp: new Date().toISOString(),
    };

    return {
      success: false,
      response: NextResponse.json(errorResponse, { status: 400 }),
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

/**
 * Format Zod errors into a user-friendly array
 */
export function formatZodErrors(
  zodError: z.ZodError
): Array<{ field: string; message: string; code: string }> {
  return zodError.issues.map((err: z.ZodIssue) => ({
    field: err.path.join('.') || 'root',
    message: err.message,
    code: err.code,
  }));
}
