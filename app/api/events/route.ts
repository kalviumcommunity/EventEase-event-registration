import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/responseHandler';
import { ERROR_CODES } from '@/lib/errorCodes';
import { createEventSchema, CreateEventRequest } from '@/lib/schemas/eventSchema';
import { validateRequest } from '@/lib/schemas/validationUtils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const organizerId = searchParams.get('organizerId');

    if (page < 1 || limit < 1) {
      return sendError(
        'Page and limit must be positive numbers',
        ERROR_CODES.INVALID_INPUT,
        400
      );
    }

    // organizerId is kept as a string to match Prisma schema expectations
    const where = organizerId ? { organizerId } : {};

    const events = await prisma.event.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { date: 'asc' }
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

export async function POST(req: Request) {
  try {
    const validation = await validateRequest(req, createEventSchema);

    if (!validation.success) {
      return validation.response!;
    }

    const data = validation.data as CreateEventRequest;

    const event = await prisma.event.create({ 
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        capacity: data.capacity,
        date: new Date(data.date), 
        organizerId: String(data.organizerId), 
      }
    });

    return sendSuccess(event, 'Event created successfully', 201);
  } catch (error: any) {
    console.error('[POST /api/events] Error:', error);

    if (error.code === 'P2002') {
      return sendError(
        'An event with this title already exists',
        ERROR_CODES.DUPLICATE_ENTRY,
        409
      );
    }

    if (error.code === 'P2003') {
      return sendError(
        'Referenced organizer not found. Please check the organizerId.',
        ERROR_CODES.CONSTRAINT_VIOLATION,
        400
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

// Fixed 'unused variable' error by prefixing with underscore
export async function PUT(_req: Request) {
  return sendError(
    'PUT requests require a specific event ID in the URL path: /api/events/[id]',
    ERROR_CODES.INVALID_INPUT,
    400
  );
}

// Fixed 'unused variable' error by prefixing with underscore
export async function DELETE(_req: Request) {
  return sendError(
    'DELETE requests require a specific event ID in the URL path: /api/events/[id]',
    ERROR_CODES.INVALID_INPUT,
    400
  );
}