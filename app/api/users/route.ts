import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/responseHandler';
import { ERROR_CODES } from '@/lib/errorCodes';
import { createUserSchema, updateUserSchema } from '@/lib/schemas/userSchema';
import { validateRequest } from '@/lib/schemas/validationUtils';

/**
 * GET /api/users - List users with pagination and filtering
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 *
 * Uses try/catch to ensure all errors are caught and formatted consistently
 * with the centralized response handler.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;

    // Validate pagination parameters
    if (page < 1 || limit < 1) {
      return sendError(
        'Page and limit must be positive numbers',
        ERROR_CODES.INVALID_INPUT,
        400
      );
    }

    const users = await prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });

    return sendSuccess(users, 'Users retrieved successfully', 200);
  } catch (error) {
    console.error('[GET /api/users] Error:', error);
    return sendError(
      'Failed to retrieve users',
      ERROR_CODES.DATABASE_FAILURE,
      500,
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

/**
 * POST /api/users - Create a new user
 *
 * Request Body (validated with Zod schema):
 * - email: Valid email address (required)
 * - name: String, min 2 characters (required)
 * - password: Min 8 characters with uppercase, lowercase, and number (required)
 *
 * Returns 201 (Created) on success, 400 (Bad Request) for validation errors,
 * or 500 (Internal Error) for database issues.
 *
 * Why Zod validation here?
 * - Catches invalid data before database layer
 * - Returns structured field-level errors
 * - Ensures data conforms to schema before creation
 * - Reduces database load from malformed requests
 *
 * Schema reuse benefits:
 * - Same validation rules can be used in frontend forms
 * - Guaranteed consistency between client and server
 * - Easy to maintain validation rules in one place
 */
export async function POST(req: Request) {
  try {
    // Validate request body using Zod schema
    // Returns structured error response on validation failure
    const validation = await validateRequest(req, createUserSchema);

    if (!validation.success) {
      return validation.response!;
    }

    // At this point, data is guaranteed to be valid per createUserSchema
    const user = await prisma.user.create({ data: validation.data });

    return sendSuccess(user, 'User created successfully', 201);
  } catch (error: any) {
    console.error('[POST /api/users] Error:', error);

    // Handle specific database constraint violations
    if (error.code === 'P2002') {
      return sendError(
        'A user with this email already exists',
        ERROR_CODES.DUPLICATE_ENTRY,
        409
      );
    }

    return sendError(
      'Failed to create user',
      ERROR_CODES.DATABASE_FAILURE,
      500,
      { error: error.message }
    );
  }
}

/**
 * PUT /api/users/:id - Update a user
 *
 * URL Parameters:
 * - id: User ID (numeric)
 *
 * Note: In Next.js App Router, route parameters come from the URL path,
 * not from req.query. For dynamic routes, use route groups or endpoint structure.
 * This is a placeholder for context; actual implementation requires
 * a route file at app/api/users/[id]/route.ts
 */
export async function PUT(req: Request) {
  try {
    return sendError(
      'PUT requests require a specific user ID in the URL path',
      ERROR_CODES.INVALID_INPUT,
      400
    );
  } catch (error) {
    console.error('[PUT /api/users] Error:', error);
    return sendError(
      'Failed to update user',
      ERROR_CODES.DATABASE_FAILURE,
      500
    );
  }
}

/**
 * DELETE /api/users/:id - Delete a user
 *
 * URL Parameters:
 * - id: User ID (numeric)
 *
 * Note: Like PUT, DELETE requires dynamic route handling.
 * See app/api/users/[id]/route.ts for implementation.
 */
export async function DELETE(req: Request) {
  try {
    return sendError(
      'DELETE requests require a specific user ID in the URL path',
      ERROR_CODES.INVALID_INPUT,
      400
    );
  } catch (error) {
    console.error('[DELETE /api/users] Error:', error);
    return sendError(
      'Failed to delete user',
      ERROR_CODES.DATABASE_FAILURE,
      500
    );
  }
}