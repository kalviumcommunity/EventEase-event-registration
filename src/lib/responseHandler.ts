/**
 * Centralized API response handler for EventEase.
 *
 * Why centralized response handling?
 * - Consistency: Every API endpoint follows the same response format
 * - Maintainability: Change response structure once, all endpoints benefit
 * - Error handling: Standardized error responses with proper HTTP status codes
 * - Debugging: Every response includes a timestamp, making logs easier to trace
 *
 * How consistent envelopes help:
 * - Frontend Integration: Client code can rely on a predictable structure
 * - Error Handling: Structured error codes instead of free-text messages
 * - Observability: Easier to log, monitor, and alert on specific error scenarios
 * - API Documentation: Single, unified response format for all endpoints
 *
 * HTTP Status Code Semantics:
 * - 200: Success (GET, PUT)
 * - 201: Created (POST)
 * - 400: Bad Request (validation errors)
 * - 401: Unauthorized
 * - 403: Forbidden
 * - 404: Not Found
 * - 409: Conflict (duplicate resources)
 * - 500: Internal Server Error (database, unhandled exceptions)
 */

import { NextResponse } from 'next/server';
import { ERROR_CODE_TO_STATUS, ERROR_CODE_MESSAGES } from './errorCodes';

/**
 * Standard API response envelope structure.
 * This envelope is used for both successful and error responses.
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: {
    code: string;
    details?: any;
  };
  timestamp: string;
}

/**
 * Send a successful API response.
 *
 * @param data - The data payload to return to the client
 * @param message - Optional custom success message (default: "Operation successful")
 * @param status - Optional HTTP status code (default: 200)
 *
 * Example:
 * ```ts
 * const users = await prisma.user.findMany();
 * return sendSuccess(users, 'Users retrieved successfully');
 * ```
 */
export function sendSuccess<T>(
  data: T,
  message: string = 'Operation successful',
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Send an error API response.
 *
 * @param message - User-friendly error message
 * @param code - Machine-readable error code (from ERROR_CODES)
 * @param status - Optional HTTP status code (auto-detected from code if available)
 * @param details - Optional additional error details for debugging
 *
 * Example:
 * ```ts
 * const user = await prisma.user.findUnique({ where: { id } });
 * if (!user) {
 *   return sendError('User not found', 'USER_NOT_FOUND', 404);
 * }
 * ```
 */
export function sendError(
  message?: string,
  code: string = 'INTERNAL_ERROR',
  status?: number,
  details?: any
): NextResponse<ApiResponse> {
  const httpStatus = status || ERROR_CODE_TO_STATUS[code] || 500;

  const errorMessage = message || ERROR_CODE_MESSAGES[code] || 'An error occurred';

  return NextResponse.json(
    {
      success: false,
      message: errorMessage,
      error: {
        code,
        ...(details && { details }),
      },
      timestamp: new Date().toISOString(),
    },
    { status: httpStatus }
  );
}
