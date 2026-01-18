import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ log: ['info', 'warn', 'error'] });

/**
 * Seeding Script with Transaction Demonstrations
 *
 * This script sets up initial data and demonstrates advanced Prisma patterns:
 * 1. Basic seeding (users, events, registrations)
 * 2. Transaction-based registration with rollback testing
 * 3. Performance logging and metrics
 * 4. Query optimization examples
 */

async function main() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('  EVENTEASE - DATABASE SEEDING WITH ADVANCED PATTERNS');
  console.log('════════════════════════════════════════════════════════════════\n');

  try {
    console.log('📋 PART 1: Setting up base data...\n');

    const organizer = await prisma.user.upsert({
      where: { email: 'organizer@events.local' },
      update: {
        name: 'Demo Organizer',
        role: 'VIEWER',
      },
      create: {
        name: 'Demo Organizer',
        email: 'organizer@events.local',
        passwordHash: 'demo-hash-organizer',
        role: 'VIEWER',
      },
    });

    console.log(`✓ Organizer: ${organizer.name} (${organizer.email})`);

    const user = await prisma.user.upsert({
      where: { email: 'demo@events.local' },
      update: {
        name: 'Demo User',
        role: 'VIEWER',
      },
      create: {
        name: 'Demo User',
        email: 'demo@events.local',
        passwordHash: 'demo-hash',
        role: 'VIEWER',
      },
    });

    console.log(`✓ User: ${user.name} (${user.email})\n`);

    let event = await prisma.event.findFirst({
      where: { title: 'Tech Conference 2026', organizerId: organizer.id },
    });

    if (!event) {
      event = await prisma.event.create({
        data: {
          title: 'Tech Conference 2026',
          description:
            'Annual technology conference with advanced Prisma workshops',
          date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
          location: 'San Francisco Convention Center',
          capacity: 100,
          organizerId: organizer.id,
        },
      });

      console.log(`✓ Event: ${event.title}`);
      console.log(`  - ID: ${event.id}`);
      console.log(`  - Capacity: ${event.capacity}`);
      console.log(`  - Date: ${event.date.toISOString()}\n`);
    } else {
      console.log(`✓ Event exists: ${event.title} (capacity: ${event.capacity})\n`);
    }

    // ─────────────────────────────────────────────────────────────────────
    // PART 2: Transaction Demonstration
    // ─────────────────────────────────────────────────────────────────────

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  🔄 PART 2: TRANSACTION PATTERN - Atomic Registration');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('Scenario: Register user for event with capacity check\n');

    // Get current event state
    const eventBefore = await prisma.event.findUnique({
      where: { id: event.id },
      select: { capacity: true },
    });

    console.log(`Before Transaction:`);
    console.log(`  - Event capacity: ${eventBefore?.capacity}`);
    console.log(`  - User: ${user.email}`);
    console.log(`  - Expected action: Create registration + decrement capacity\n`);

    const transactionStartTime = Date.now();

    try {
      // Execute transaction with atomicity guarantee
      const result = await prisma.$transaction(
        async (tx) => {
          console.log(`  [TX] 1️⃣  Verifying user exists...`);
          const existingUser = await tx.user.findUnique({
            where: { id: user.id },
            select: { id: true, email: true },
          });

          if (!existingUser) throw new Error('User not found');
          console.log(`  [TX]     ✓ User verified: ${existingUser.email}`);

          console.log(`  [TX] 2️⃣  Checking event capacity...`);
          const existingEvent = await tx.event.findUnique({
            where: { id: event.id },
            select: { capacity: true, title: true },
          });

          if (!existingEvent) throw new Error('Event not found');
          if (existingEvent.capacity <= 0) {
            throw new Error('Event has no available capacity');
          }
          console.log(`  [TX]     ✓ Capacity available: ${existingEvent.capacity}`);

          console.log(`  [TX] 3️⃣  Creating registration record...`);
          const registration = await tx.registration.create({
            data: { userId: user.id, eventId: event.id },
            select: { id: true, createdAt: true },
          });
          console.log(`  [TX]     ✓ Registration created: ${registration.id}`);

          console.log(`  [TX] 4️⃣  Decrementing capacity...`);
          const updatedEvent = await tx.event.update({
            where: { id: event.id },
            data: { capacity: { decrement: 1 } },
            select: { capacity: true },
          });
          console.log(
            `  [TX]     ✓ Capacity updated: ${existingEvent.capacity} → ${updatedEvent.capacity}`,
          );

          return { registration, event: updatedEvent };
        },
        {
          isolationLevel: 'ReadCommitted',
          timeout: 10000,
        },
      );

      const transactionDuration = Date.now() - transactionStartTime;

      console.log(`\n✓ Transaction completed successfully in ${transactionDuration}ms`);
      console.log(`\nAfter Transaction:`);
      console.log(`  - Registration ID: ${result.registration.id}`);
      console.log(`  - New capacity: ${result.event.capacity}`);
      console.log(`  - Atomicity: GUARANTEED (all or nothing)\n`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(`\n✗ Transaction failed: ${errorMsg}`);
      console.log(
        `  → ROLLBACK: All changes reverted, database remains consistent\n`,
      );
    }

    // ─────────────────────────────────────────────────────────────────────
    // PART 3: Rollback Test (Intentional Failure)
    // ─────────────────────────────────────────────────────────────────────

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  🔁 PART 3: ROLLBACK TEST - Failure Scenario');
    console.log('═══════════════════════════════════════════════════════════════\n');

    // Create a test user
    const testUser = await prisma.user.upsert({
      where: { email: 'test-rollback@events.local' },
      update: { name: 'Rollback Tester' },
      create: {
        name: 'Rollback Tester',
        email: 'test-rollback@events.local',
        passwordHash: 'test-hash',
      },
    });

    // Create an event with capacity = 0 to force failure
    const fullEvent = await prisma.event.create({
      data: {
        title: 'Full Event (No Capacity)',
        description: 'Event at full capacity to test rollback',
        date: new Date(Date.now() + 1000 * 60 * 60 * 24),
        location: 'Test Location',
        capacity: 0, // No capacity available
        organizerId: organizer.id,
      },
    });

    console.log(
      `Testing rollback: User attempts to register for FULL event (capacity = 0)\n`,
    );

    console.log(`Before rollback test:`);
    const fullEventBefore = await prisma.event.findUnique({
      where: { id: fullEvent.id },
      select: { capacity: true, _count: { select: { registrations: true } } },
    });
    console.log(`  - Event capacity: ${fullEventBefore?.capacity}`);
    console.log(`  - Current registrations: ${fullEventBefore?._count.registrations}\n`);

    // Attempt transaction that will fail
    console.log(`Attempting registration...`);
    try {
      await prisma.$transaction(async (tx) => {
        console.log(`  [TX] Checking capacity...`);
        const checkEvent = await tx.event.findUnique({
          where: { id: fullEvent.id },
          select: { capacity: true },
        });

        if (!checkEvent || checkEvent.capacity <= 0) {
          throw new Error('❌ CAPACITY CHECK FAILED: Event is full');
        }

        // This line never executes due to the error above
        await tx.registration.create({
          data: { userId: testUser.id, eventId: fullEvent.id },
        });
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(`  [ERROR] ${errorMsg}\n`);
    }

    console.log(`After rollback test:`);
    const fullEventAfter = await prisma.event.findUnique({
      where: { id: fullEvent.id },
      select: { capacity: true, _count: { select: { registrations: true } } },
    });
    console.log(`  - Event capacity: ${fullEventAfter?.capacity}`);
    console.log(`  - Current registrations: ${fullEventAfter?._count.registrations}`);

    const noPartialWrites =
      fullEventBefore?.capacity === fullEventAfter?.capacity &&
      fullEventBefore?._count.registrations ===
        fullEventAfter?._count.registrations;

    console.log(
      `\n✓ Rollback Success: ${noPartialWrites ? '✓ NO PARTIAL WRITES' : '✗ PARTIAL WRITES DETECTED!'}\n`,
    );

    // ─────────────────────────────────────────────────────────────────────
    // PART 4: Query Optimization Examples
    // ─────────────────────────────────────────────────────────────────────

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  ⚡ PART 4: Query Optimization Examples');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('Example 1: Selective field fetching (avoid over-fetching)');
    const optimizedEvents = await prisma.event.findMany({
      select: {
        id: true,
        title: true,
        date: true,
        _count: { select: { registrations: true } },
      },
      take: 5,
    });
    console.log(`✓ Fetched ${optimizedEvents.length} events with minimal data\n`);

    console.log('Example 2: Pagination (large dataset handling)');
    const paginatedEvents = await prisma.event.findMany({
      select: { id: true, title: true },
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
    });
    console.log(`✓ Fetched page 1: ${paginatedEvents.length} events\n`);

    console.log('Example 3: N+1 prevention (relation loading)');
    const eventsWithRegistrations = await prisma.event.findMany({
      select: {
        title: true,
        registrations: {
          select: {
            user: { select: { name: true, email: true } },
          },
        },
      },
      take: 3,
    });
    console.log(
      `✓ Fetched ${eventsWithRegistrations.length} events with registrations (1 query, no N+1)\n`,
    );

    // ─────────────────────────────────────────────────────────────────────
    // Summary
    // ─────────────────────────────────────────────────────────────────────

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('  ✅ SEEDING COMPLETED');
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('Summary:');
    console.log(`  ✓ Base data created (users, events)`);
    console.log(`  ✓ Transaction pattern demonstrated`);
    console.log(`  ✓ Rollback behavior verified`);
    console.log(`  ✓ Query optimizations shown`);
    console.log('\nNext steps:');
    console.log(`  1. Review src/lib/eventRegistration.ts for transaction details`);
    console.log(`  2. Review src/lib/queryOptimizations.ts for optimization patterns`);
    console.log(`  3. Run API tests: curl http://localhost:3000/api/prisma-test`);
    console.log(`  4. Monitor logs for query performance metrics\n`);
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the seed when run directly with ts-node.
if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}



