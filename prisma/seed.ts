import { PrismaClient } from '@prisma/client';

// For Prisma v7, the client needs either an adapter or to use a specific engine configuration
// Since we're using the binary engine, we instantiate without extra options
const prisma = new PrismaClient({
  log: ['error'],
});

async function main() {
  try {
    // Create a demo user
    const user = await prisma.user.upsert({
      where: { email: 'demo@events.local' },
      update: {},
      create: {
        name: 'Demo User',
        email: 'demo@events.local',
        passwordHash: 'demo-hash',
        role: 'USER',
      },
    });

    // Create a sample event organized by the demo user
    const event = await prisma.event.create({
      data: {
        title: 'Demo Event',
        description: 'A sample event created for seeding purposes.',
        date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // one week from now
        location: 'Online',
        capacity: 100,
        organizerId: user.id,
      },
    });

    // Create a registration linking the user and event
    await prisma.registration.create({
      data: {
        userId: user.id,
        eventId: event.id,
      },
    });

    console.log('✓ Seeding completed successfully!');
    console.log(`  - Created user: ${user.email}`);
    console.log(`  - Created event: ${event.title}`);
    console.log(`  - Created registration linking user and event`);
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

