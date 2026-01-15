import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/responseHandler';
import { ERROR_CODES } from '@/lib/errorCodes';

/**
 * GET /api/registrations - List registrations with pagination and filtering
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - userId: Filter by user ID (optional)
 *
 * Demonstrates the same centralized response pattern used across EventEase API.
 * All handlers follow: Validate → Query → sendSuccess/sendError pattern.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const userId = searchParams.get('userId');

    // Validate pagination parameters
    if (page < 1 || limit < 1) {
      return sendError(
        'Page and limit must be positive numbers',
        ERROR_CODES.INVALID_INPUT,
        400
      );
    }

    // Build dynamic where clause for filtering
    const where = userId ? { userId: Number(userId) } : {};

    const registrations = await prisma.registration.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });

    return sendSuccess(registrations, 'Registrations retrieved successfully', 200);
  } catch (error) {
    console.error('[GET /api/registrations] Error:', error);
    return sendError(
      'Failed to retrieve registrations',
      ERROR_CODES.DATABASE_FAILURE,
      500,
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

/**
 * POST /api/registrations - Create a new registration
 *
 * Request Body:
 * - userId: ID of the registering user (required)
 * - eventId: ID of the event to register for (required)
 * - Other fields based on schema
 *
 * Demonstrates error handling for both validation and database constraint violations.
 */
export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Validate required fields
    if (!data.userId || !data.eventId) {
      return sendError(
        'userId and eventId are required',
        ERROR_CODES.MISSING_REQUIRED_FIELD,
        400
      );
    }

    const registration = await prisma.registration.create({ data });

    return sendSuccess(registration, 'Registration created successfully', 201);
  } catch (error: any) {
    console.error('[POST /api/registrations] Error:', error);

    // Handle duplicate registration (Prisma P2002)
    if (error.code === 'P2002') {
      return sendError(
        'User is already registered for this event',
        ERROR_CODES.DUPLICATE_ENTRY,
        409
      );
    }

    // Handle foreign key constraint (Prisma P2003)
    if (error.code === 'P2003') {
      return sendError(
        'Referenced user or event not found',
        ERROR_CODES.CONSTRAINT_VIOLATION,
        400,
        { error: error.message }
      );
    }

    return sendError(
      'Failed to create registration',
      ERROR_CODES.DATABASE_FAILURE,
      500,
      { error: error.message }
    );
  }
}

/**
 * PUT /api/registrations/:id - Update a registration
 *
 * URL Parameters:
 * - id: Registration ID (numeric)
 *
 * Note: Requires app/api/registrations/[id]/route.ts for dynamic route handling.
 */
export async function PUT(req: Request) {
  try {
    return sendError(
      'PUT requests require a specific registration ID in the URL path',
      ERROR_CODES.INVALID_INPUT,
      400
    );
  } catch (error) {
    console.error('[PUT /api/registrations] Error:', error);
    return sendError(
      'Failed to update registration',
      ERROR_CODES.DATABASE_FAILURE,
      500
    );
  }
}

/**
 * DELETE /api/registrations/:id - Delete a registration
 *
 * URL Parameters:
 * - id: Registration ID (numeric)
 *
 * Note: Requires app/api/registrations/[id]/route.ts for dynamic route handling.
 */
export async function DELETE(req: Request) {
  try {
    return sendError(
      'DELETE requests require a specific registration ID in the URL path',
      ERROR_CODES.INVALID_INPUT,
      400
    );
  } catch (error) {
    console.error('[DELETE /api/registrations] Error:', error);
    return sendError(
      'Failed to delete registration',
      ERROR_CODES.DATABASE_FAILURE,
      500
    );
  }
}