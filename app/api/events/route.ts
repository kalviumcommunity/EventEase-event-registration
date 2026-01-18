import prisma from '@/lib/prisma';
import redis from '@/lib/redis';
import logger, { withRequestId } from '@/lib/logger';
import { sendSuccess, sendError } from '@/lib/responseHandler';
import { ERROR_CODES } from '@/lib/errorCodes';
import { createEventSchema, CreateEventRequest } from '@/lib/schemas/eventSchema';
import { validateRequest } from '@/lib/schemas/validationUtils';
import { sanitize } from '@/lib/security';
import { corsHandler } from '@/lib/cors';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || 'unknown';

  return withRequestId(requestId, async () => {
    const corsResponse = corsHandler(req);
    if (corsResponse.status === 403) return corsResponse;

    try {
      logger.info({ message: 'Fetching events', method: req.method, path: req.nextUrl.pathname });

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

      // For simplicity, cache only when no filters are applied (all events)
      const cacheKey = 'events:all';

      try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          logger.info({ message: 'Cache hit for events' });
          const events = JSON.parse(cachedData);
          return sendSuccess(events, 'Events retrieved from cache', 200);
        }
      } catch (redisError) {
        logger.warn({ message: 'Redis error during cache read', error: redisError instanceof Error ? redisError.message : 'Unknown Redis error' });
        // Continue to database fetch on Redis failure
      }

      logger.info({ message: 'Cache miss for events' });

      // organizerId is kept as a string to match Prisma schema expectations
      const where = organizerId ? { organizerId } : {};

      const events = await prisma.event.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { date: 'asc' }
      });

      // Cache the result only if no filters (organizerId) are applied
      if (!organizerId) {
        try {
          await redis.setex(cacheKey, 60, JSON.stringify(events));
        } catch (redisError) {
          logger.warn({ message: 'Redis error during cache write', error: redisError instanceof Error ? redisError.message : 'Unknown Redis error' });
          // Don't fail the request if caching fails
        }
      }

      return sendSuccess(events, 'Events retrieved successfully', 200);
    } catch (error) {
      logger.error({ message: 'Database error during event retrieval', error: error instanceof Error ? error.message : 'Unknown error' });
      return sendError(
        'Failed to retrieve events',
        ERROR_CODES.DATABASE_FAILURE,
        500,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  });
}

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || 'unknown';

  return withRequestId(requestId, async () => {
    const corsResponse = corsHandler(req);
    if (corsResponse.status === 403) return corsResponse;

    try {
      logger.info({ message: 'Creating new event', method: req.method, path: req.nextUrl.pathname });

      const validation = await validateRequest(req, createEventSchema);

      if (!validation.success) {
        return validation.response!;
      }

      const data = validation.data as CreateEventRequest;

      // Sanitize user-provided strings to prevent XSS
      const sanitizedData = {
        title: sanitize(data.title),
        description: sanitize(data.description),
        location: sanitize(data.location),
        capacity: data.capacity,
        date: new Date(data.date),
        organizerId: String(data.organizerId),
      };

      const event = await prisma.event.create({
        data: sanitizedData
      });

      // Invalidate cache on new event creation
      try {
        await redis.del('events:all');
        logger.info({ message: 'Cache invalidated after new event creation' });
      } catch (redisError) {
        logger.warn({ message: 'Redis error during cache invalidation', error: redisError instanceof Error ? redisError.message : 'Unknown Redis error' });
        // Don't fail the request if invalidation fails
      }

      return sendSuccess(event, 'Event created successfully', 201);
    } catch (error: any) {
      logger.error({ message: 'Database error during event creation', error: error.message });

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
  });
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