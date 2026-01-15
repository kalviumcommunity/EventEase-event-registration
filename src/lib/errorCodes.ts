/**
 * Centralized error code definitions for EventEase API.
 *
 * Error codes provide a standardized way to categorize errors, making it easier for:
 * - Frontend developers to handle specific error scenarios programmatically
 * - DevOps teams to monitor and alert on specific error types
 * - Debugging by providing structured, machine-readable error information
 *
 * Instead of free-text error messages (e.g., "Something went wrong"), error codes
 * allow both client and server to reference the same error taxonomy, improving
 * reliability and maintainability.
 */

export const ERROR_CODES = {
  // Validation errors (4xx range)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Resource not found (404)
  NOT_FOUND: 'NOT_FOUND',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  REGISTRATION_NOT_FOUND: 'REGISTRATION_NOT_FOUND',

  // Conflict errors (409)
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',

  // Database errors (5xx range)
  DATABASE_FAILURE: 'DATABASE_FAILURE',
  DATABASE_CONNECTION_ERROR: 'DATABASE_CONNECTION_ERROR',
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',

  // Server errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  OPERATION_FAILED: 'OPERATION_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
};

/**
 * Map error codes to HTTP status codes.
 * This ensures consistent HTTP semantics across the API.
 */
export const ERROR_CODE_TO_STATUS: Record<string, number> = {
  [ERROR_CODES.VALIDATION_ERROR]: 400,
  [ERROR_CODES.INVALID_INPUT]: 400,
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 400,
  [ERROR_CODES.NOT_FOUND]: 404,
  [ERROR_CODES.USER_NOT_FOUND]: 404,
  [ERROR_CODES.EVENT_NOT_FOUND]: 404,
  [ERROR_CODES.REGISTRATION_NOT_FOUND]: 404,
  [ERROR_CODES.DUPLICATE_ENTRY]: 409,
  [ERROR_CODES.RESOURCE_ALREADY_EXISTS]: 409,
  [ERROR_CODES.DATABASE_FAILURE]: 500,
  [ERROR_CODES.DATABASE_CONNECTION_ERROR]: 500,
  [ERROR_CODES.CONSTRAINT_VIOLATION]: 500,
  [ERROR_CODES.INTERNAL_ERROR]: 500,
  [ERROR_CODES.OPERATION_FAILED]: 500,
  [ERROR_CODES.UNAUTHORIZED]: 401,
  [ERROR_CODES.FORBIDDEN]: 403,
};

/**
 * User-friendly error messages for each error code.
 * These can be sent to the frontend as the primary error message.
 */
export const ERROR_CODE_MESSAGES: Record<string, string> = {
  [ERROR_CODES.VALIDATION_ERROR]: 'The provided data is invalid.',
  [ERROR_CODES.INVALID_INPUT]: 'Invalid input provided.',
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: 'Required field is missing.',
  [ERROR_CODES.NOT_FOUND]: 'Resource not found.',
  [ERROR_CODES.USER_NOT_FOUND]: 'User not found.',
  [ERROR_CODES.EVENT_NOT_FOUND]: 'Event not found.',
  [ERROR_CODES.REGISTRATION_NOT_FOUND]: 'Registration not found.',
  [ERROR_CODES.DUPLICATE_ENTRY]: 'This resource already exists.',
  [ERROR_CODES.RESOURCE_ALREADY_EXISTS]: 'Resource already exists.',
  [ERROR_CODES.DATABASE_FAILURE]: 'Database operation failed.',
  [ERROR_CODES.DATABASE_CONNECTION_ERROR]: 'Unable to connect to database.',
  [ERROR_CODES.CONSTRAINT_VIOLATION]: 'Operation violates data constraints.',
  [ERROR_CODES.INTERNAL_ERROR]: 'An internal error occurred.',
  [ERROR_CODES.OPERATION_FAILED]: 'Operation failed.',
  [ERROR_CODES.UNAUTHORIZED]: 'Unauthorized access.',
  [ERROR_CODES.FORBIDDEN]: 'Forbidden.',
};
