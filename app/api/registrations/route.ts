import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/responseHandler';
import { ERROR_CODES } from '@/lib/errorCodes';

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

    /**
     * FIX: Removed Number(userId) conversion.
     * Prisma expects a string for the ID filter.
     */
    const where = userId ? { userId } : {};

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

    /**
     * NOTE: If your database uses CUID/UUID (strings), 
     * ensure the data passed here matches those types.
     */
    const registration = await prisma.registration.create({ data });

    return sendSuccess(registration, 'Registration created successfully', 201);
  } catch (error: any) {
    console.error('[POST /api/registrations] Error:', error);

    if (error.code === 'P2002') {
      return sendError(
        'User is already registered for this event',
        ERROR_CODES.DUPLICATE_ENTRY,
        409
      );
    }

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
 * FIX: Added underscore to _req to satisfy 'unused parameter' build rule
 */
export async function PUT(_req: Request) {
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
 * FIX: Added underscore to _req to satisfy 'unused parameter' build rule
 */
export async function DELETE(_req: Request) {
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