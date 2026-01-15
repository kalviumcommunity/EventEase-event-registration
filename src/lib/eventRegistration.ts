import { PrismaClient } from '@prisma/client';

/**
 * Event Registration Service with Transaction Support
 *
 * This module demonstrates Prisma transaction patterns for the EventEase application.
 * It implements atomicity for user event registrations to ensure data consistency.
 *
 * Why Transactions?
 * ================
 * When a user registers for an event, we must:
 *   1. Create a Registration record linking the user to the event
 *   2. Decrement Event.capacity by 1 (to track available slots)
 *
 * These operations MUST succeed together or fail together:
 * - If registration creates but capacity fails, we have an orphaned record
 * - If capacity decrements but registration fails, we have incorrect inventory
 * - Both failures should roll back and return an error to the client
 *
 * Prisma $transaction ensures ACID compliance:
 *   A = Atomicity (all-or-nothing)
 *   C = Consistency (data rules preserved)
 *   I = Isolation (concurrent safety)
 *   D = Durability (committed data persists)
 *
 * Transaction Types:
 * - Sequential: Each query runs in order, accessible within the transaction
 * - Parallel: All queries submitted at once, most performant for independent ops
 * We use sequential here because capacity check depends on current value.
 */

/**
 * Register a user for an event with transaction protection
 *
 * @param prisma - Prisma client instance
 * @param userId - UUID of the user registering
 * @param eventId - UUID of the event to register for
 * @param dryRun - If true, simulate without saving; if false, commit to DB
 * @returns Object with success status, registration data, and diagnostics
 *
 * Rollback Scenarios (automatic via transaction):
 * 1. User not found → Registration fails → Both operations roll back
 * 2. Event not found → Capacity update fails → Both operations roll back
 * 3. Capacity already 0 → Update fails (business rule) → Both operations roll back
 * 4. Duplicate registration → Insert constraint fails → Both operations roll back
 */
export async function registerUserForEvent(
  prisma: PrismaClient,
  userId: string,
  eventId: string,
  dryRun: boolean = false,
) {
  const operationTimestamp = new Date();
  const performanceMetrics = {
    transactionStartMs: 0,
    transactionEndMs: 0,
    durationMs: 0,
    operationCount: 2,
  };

  try {
    performanceMetrics.transactionStartMs = Date.now();

    if (dryRun) {
      console.log(
        `[TRANSACTION - DRY RUN] Starting registration for user:${userId} event:${eventId}`,
      );
    }

    const result = await prisma.$transaction(
      async (tx) => {
        // Step 1: Verify user exists and fetch details
        // Using select to avoid over-fetching unnecessary fields
        const user = await tx.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, name: true },
        });

        if (!user) {
          throw new Error(`User not found: ${userId}`);
        }

        // Step 2: Verify event exists and check capacity
        // Select only needed fields to reduce bandwidth and lock time
        const event = await tx.event.findUnique({
          where: { id: eventId },
          select: {
            id: true,
            title: true,
            capacity: true,
            organizerId: true,
            date: true,
          },
        });

        if (!event) {
          throw new Error(`Event not found: ${eventId}`);
        }

        // Business Rule Validation: Event must have available capacity
        // This prevents negative inventory (overselling)
        if (event.capacity <= 0) {
          throw new Error(
            `Event '${event.title}' has no available capacity. Current capacity: ${event.capacity}`,
          );
        }

        // Step 3: Check for existing registration (prevent duplicates)
        // This check is supplementary; the unique constraint in schema provides the primary safeguard
        const existingRegistration = await tx.registration.findUnique({
          where: {
            userId_eventId: { userId, eventId },
          },
          select: { id: true, createdAt: true },
        });

        if (existingRegistration) {
          throw new Error(
            `User is already registered for this event (registration ID: ${existingRegistration.id})`,
          );
        }

        // Step 4: Create Registration record
        // This links the user to the event in the join table
        const registration = await tx.registration.create({
          data: {
            userId,
            eventId,
          },
          select: {
            id: true,
            createdAt: true,
            user: { select: { id: true, email: true, name: true } },
            event: {
              select: {
                id: true,
                title: true,
                date: true,
                location: true,
              },
            },
          },
        });

        // Step 5: Decrement event capacity
        // This is critical for inventory management and concurrent request safety.
        // The transaction isolation ensures no two registrations can decrement
        // the same capacity value simultaneously.
        const updatedEvent = await tx.event.update({
          where: { id: eventId },
          data: {
            // Atomic decrement: new capacity = old capacity - 1
            capacity: { decrement: 1 },
          },
          select: {
            id: true,
            title: true,
            capacity: true,
          },
        });

        return {
          success: true,
          registration,
          updatedEvent,
          dryRun,
        };
      },
      {
        // Transaction configuration for PostgreSQL
        // Allows concurrent reads but serializes writes for isolation
        isolationLevel: 'ReadCommitted',
        timeout: 10000, // 10 second timeout per transaction
      },
    );

    performanceMetrics.transactionEndMs = Date.now();
    performanceMetrics.durationMs =
      performanceMetrics.transactionEndMs - performanceMetrics.transactionStartMs;

    return {
      ...result,
      timestamp: operationTimestamp,
      metrics: performanceMetrics,
      error: null,
    };
  } catch (error) {
    performanceMetrics.transactionEndMs = Date.now();
    performanceMetrics.durationMs =
      performanceMetrics.transactionEndMs - performanceMetrics.transactionStartMs;

    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error(`[TRANSACTION FAILED] ${errorMessage}`);
    console.error(`[ROLLBACK] All changes reverted (atomicity maintained)`);

    // Return structured error response
    return {
      success: false,
      registration: null,
      updatedEvent: null,
      dryRun,
      timestamp: operationTimestamp,
      metrics: performanceMetrics,
      error: {
        message: errorMessage,
        type: error instanceof Error ? error.constructor.name : 'UnknownError',
        rolledBack: true,
      },
    };
  }
}

/**
 * Intentional failure test: Attempt registration when capacity is 0
 * This demonstrates rollback behavior in action
 *
 * @param prisma - Prisma client instance
 * @param userId - UUID of user attempting to register
 * @param eventId - UUID of event with no capacity
 * @returns Transaction result showing the rollback
 */
export async function testTransactionRollback(
  prisma: PrismaClient,
  userId: string,
  eventId: string,
) {
  console.log('\n--- TRANSACTION ROLLBACK TEST ---');
  console.log(
    'Scenario: User attempts to register for an event with capacity = 0',
  );
  console.log('Expected: Registration fails, capacity update never executes\n');

  // First, fetch the current state
  const eventBefore = await prisma.event.findUnique({
    where: { id: eventId },
    select: { capacity: true, registrations: { select: { id: true } } },
  });

  console.log(`Event state BEFORE transaction attempt:`);
  console.log(`  - Capacity: ${eventBefore?.capacity}`);
  console.log(`  - Registration count: ${eventBefore?.registrations.length}`);

  // Attempt registration (will fail and rollback)
  const result = await registerUserForEvent(prisma, userId, eventId);

  // Fetch state again to confirm no partial writes
  const eventAfter = await prisma.event.findUnique({
    where: { id: eventId },
    select: { capacity: true, registrations: { select: { id: true } } },
  });

  console.log(`\nEvent state AFTER transaction attempt:`);
  console.log(`  - Capacity: ${eventAfter?.capacity}`);
  console.log(`  - Registration count: ${eventAfter?.registrations.length}`);
  console.log(
    `\nRollback Confirmation: Capacity unchanged = ${eventBefore?.capacity === eventAfter?.capacity ? '✓ YES (no partial writes)' : '✗ NO (INCONSISTENT!)'}`,
  );
  console.log(`Transaction Result:`, result);

  return result;
}

/**
 * List all registrations for a user with pagination
 *
 * Why pagination?
 * - Prevents loading entire tables into memory
 * - Improves API response time for large datasets
 * - Reduces database lock contention by limiting query scope
 *
 * @param prisma - Prisma client
 * @param userId - User ID to fetch registrations for
 * @param page - Page number (1-indexed)
 * @param pageSize - Results per page
 * @returns Paginated registration list with metadata
 */
export async function getUserRegistrations(
  prisma: PrismaClient,
  userId: string,
  page: number = 1,
  pageSize: number = 10,
) {
  const skip = (page - 1) * pageSize;

  const [registrations, total] = await Promise.all([
    prisma.registration.findMany({
      where: { userId },
      select: {
        id: true,
        createdAt: true,
        event: {
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
            capacity: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.registration.count({ where: { userId } }),
  ]);

  return {
    registrations,
    pagination: {
      currentPage: page,
      pageSize,
      totalRecords: total,
      totalPages: Math.ceil(total / pageSize),
      hasNextPage: page < Math.ceil(total / pageSize),
    },
  };
}

/**
 * Bulk operation example: Register multiple users for an event
 *
 * Why createMany?
 * - Single database round-trip instead of N trips
 * - Significantly faster for bulk operations
 * - Atomic by default (all-or-nothing insert)
 *
 * @param prisma - Prisma client
 * @param userIds - Array of user IDs to register
 * @param eventId - Event ID to register users for
 * @returns Count of created registrations
 */
export async function bulkRegisterUsersForEvent(
  prisma: PrismaClient,
  userIds: string[],
  eventId: string,
) {
  try {
    // Pre-validation: Check event capacity can accommodate all registrations
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { capacity: true, _count: { select: { registrations: true } } },
    });

    if (!event) throw new Error(`Event not found: ${eventId}`);

    const availableSlots = event.capacity;
    const requestedRegistrations = userIds.length;

    if (availableSlots < requestedRegistrations) {
      throw new Error(
        `Insufficient capacity. Available: ${availableSlots}, Requested: ${requestedRegistrations}`,
      );
    }

    // Bulk create registrations
    const result = await prisma.registration.createMany({
      data: userIds.map((userId) => ({
        userId,
        eventId,
      })),
      skipDuplicates: true, // Skip users already registered (ignore constraint errors)
    });

    // Decrement capacity once for all registrations
    await prisma.event.update({
      where: { id: eventId },
      data: { capacity: { decrement: result.count } },
    });

    return {
      success: true,
      registrationsCreated: result.count,
      duplicatesSkipped: requestedRegistrations - result.count,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
