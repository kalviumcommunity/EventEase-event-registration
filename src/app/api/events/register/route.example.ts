/**
 * Example API Route: Event Registration with Advanced Patterns
 *
 * This route demonstrates:
 * 1. Transaction-based registration
 * 2. Error handling with meaningful responses
 * 3. Performance monitoring
 * 4. Input validation
 *
 * Deploy this to: src/app/api/events/register/route.ts
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  registerUserForEvent,
  getUserRegistrations,
} from '@/lib/eventRegistration';

/**
 * POST /api/events/register
 *
 * Request body:
 * {
 *   "userId": "uuid",
 *   "eventId": "uuid"
 * }
 *
 * Response (success):
 * {
 *   "success": true,
 *   "registration": { ... },
 *   "metrics": { "durationMs": 15 }
 * }
 *
 * Response (error):
 * {
 *   "success": false,
 *   "error": "Event has no available capacity",
 *   "metrics": { "durationMs": 5 }
 * }
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse request body
    const body = await request.json();
    const { userId, eventId } = body;

    // Input validation
    if (!userId || !eventId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: userId, eventId',
        },
        { status: 400 },
      );
    }

    // Call transaction function with error handling
    const result = await registerUserForEvent(prisma, userId, eventId);

    const duration = Date.now() - startTime;

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error?.message || 'Registration failed',
          errorType: result.error?.type,
          durationMs: duration,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        registration: result.registration,
        event: result.updatedEvent,
        durationMs: duration,
      },
      { status: 201 },
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[API Error] POST /api/events/register:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        durationMs: duration,
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/events/register?userId=<uuid>&page=1
 *
 * Fetch user registrations with pagination
 *
 * Query parameters:
 * - userId (required)
 * - page (optional, default: 1)
 * - pageSize (optional, default: 10, max: 50)
 *
 * Response:
 * {
 *   "success": true,
 *   "registrations": [ ... ],
 *   "pagination": {
 *     "currentPage": 1,
 *     "pageSize": 10,
 *     "totalRecords": 25,
 *     "totalPages": 3,
 *     "hasNextPage": true
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(50, parseInt(searchParams.get('pageSize') || '10'));

    // Input validation
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameter: userId',
        },
        { status: 400 },
      );
    }

    // Fetch user registrations with pagination
    const result = await getUserRegistrations(prisma, userId, page, pageSize);

    const duration = Date.now() - startTime;

    return NextResponse.json(
      {
        success: true,
        registrations: result.registrations,
        pagination: result.pagination,
        durationMs: duration,
      },
      { status: 200 },
    );
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[API Error] GET /api/events/register:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        durationMs: duration,
      },
      { status: 500 },
    );
  }
}
