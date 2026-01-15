import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/responseHandler';
import { ERROR_CODES } from '@/lib/errorCodes';
import { createEventSchema } from '@/lib/schemas/eventSchema';
import { validateRequest } from '@/lib/schemas/validationUtils';

/**
 * GET /api/events - List events with pagination and filtering
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - organizerId: Filter by organizer ID (optional)
 *
 * Centralized response handling ensures consistent success/error envelopes,
 * making it easier for frontend clients to parse and handle responses predictably.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const organizerId = searchParams.get('organizerId');

    // Validate pagination parameters
    if (page < 1 || limit < 1) {
      return sendError(
        'Page and limit must be positive numbers',
        ERROR_CODES.INVALID_INPUT,
        400
      );
    }

    // Build dynamic where clause based on filters
    const where = organizerId
      ? { organizerId: Number(organizerId) }
      : {};

    const events = await prisma.event.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
    });

    return sendSuccess(events, 'Events retrieved successfully', 200);
  } catch (error) {
    console.error('[GET /api/events] Error:', error);
    return sendError(
      'Failed to retrieve events',
      ERROR_CODES.DATABASE_FAILURE,
      500,
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

/**
 * POST /api/events - Create a new event
 *
 * Request Body (validated with Zod schema):
 * - title: String, min 3 characters (required)
 * - description: String, optional
 * - date: ISO 8601 datetime, must be in future (required)
 * - location: String, min 2 characters (required)
 * - capacity: Number, minimum 1 (required)
 * - organizerId: ID of the organizer, must be positive integer (required)
 *
 * HTTP Status:
 * - 201: Event created successfully
 * - 400: Validation error (invalid fields or malformed request)
 * - 409: Conflict (duplicate title or constraint violation)
 * - 500: Database or server error
 *
 * Why Zod validation here?
 * - Validates complex constraints like future dates before database queries
 * - Ensures capacity is a valid positive number
 * - Catches missing or invalid organizerId early
 * - Returns detailed field-level errors for frontend validation display
 *
 * Schema reuse benefits:
 * - Frontend form validation uses the same schema
 * - Guarantees server and client enforce identical rules
 * - Reduces validation logic duplication across the codebase
 * - Easy to update all validation rules from one central location
 *
 * Using sendSuccess with status 201 correctly indicates resource creation,
 * which helps HTTP clients distinguish between updates (200) and creation (201).
 */
export async function POST(req: Request) {
  try {
    // Validate request body using Zod schema
    // Catches invalid data before database layer, reducing query overhead
    const validation = await validateRequest(req, createEventSchema);

    if (!validation.success) {
      return validation.response!;
    }

    // At this point, data is guaranteed to be valid per createEventSchema
    // All fields are properly typed, formatted, and validated
    const event = await prisma.event.create({ data: validation.data });

    return sendSuccess(event, 'Event created successfully', 201);
  } catch (error: any) {
    console.error('[POST /api/events] Error:', error);

    // Handle Prisma-specific errors
    if (error.code === 'P2002') {
      return sendError(
        'An event with this title already exists',
        ERROR_CODES.DUPLICATE_ENTRY,
        409
      );
    }

    // Handle foreign key constraint violations
    if (error.code === 'P2003') {
      return sendError(
        'Referenced organizer or related resource not found',
        ERROR_CODES.CONSTRAINT_VIOLATION,
        400,
        { error: error.message }
      );
    }

    return sendError(
      'Failed to create event',
      ERROR_CODES.DATABASE_FAILURE,
      500,
      { error: error.message }
    );
  }
}

/**
 * PUT /api/events/:id - Update an event
 *
 * URL Parameters:
 * - id: Event ID (numeric)
 *
 * Note: In Next.js App Router, to handle PUT with dynamic IDs,
 * create app/api/events/[id]/route.ts with a PUT handler.
 */
export async function PUT(req: Request) {
  try {
    return sendError(
      'PUT requests require a specific event ID in the URL path',
      ERROR_CODES.INVALID_INPUT,
      400
    );
  } catch (error) {
    console.error('[PUT /api/events] Error:', error);
    return sendError(
      'Failed to update event',
      ERROR_CODES.DATABASE_FAILURE,
      500
    );
  }
}

/**
 * DELETE /api/events/:id - Delete an event
 *
 * URL Parameters:
 * - id: Event ID (numeric)
 *
 * Note: Like PUT, DELETE requires dynamic route handling.
 * See app/api/events/[id]/route.ts for implementation.
 */
export async function DELETE(req: Request) {
  try {
    return sendError(
      'DELETE requests require a specific event ID in the URL path',
      ERROR_CODES.INVALID_INPUT,
      400
    );
  } catch (error) {
    console.error('[DELETE /api/events] Error:', error);
    return sendError(
      'Failed to delete event',
      ERROR_CODES.DATABASE_FAILURE,
      500
    );
  }
}