import { PrismaClient } from '@prisma/client';



const prisma = new PrismaClient({ log: ['info', 'warn', 'error'] });

async function main() {
  try {
    // Upsert a demo user (idempotent by unique email)
    const user = await prisma.user.upsert({
      where: { email: 'demo@events.local' },
      update: {
        // Keep name and role in sync if the script is updated.
        name: 'Demo User',
        role: 'USER',
      },
      create: {
        name: 'Demo User',
        email: 'demo@events.local',
        passwordHash: 'demo-hash',
        role: 'USER',
      },
    });

    // Ensure a demo event exists for this organizer. The Event model does not
    // have a unique constraint on `title`, so we perform a find-or-create
    // pattern to keep the seed idempotent.
    let event = await prisma.event.findFirst({
      where: { title: 'Demo Event', organizerId: user.id },
    });

    if (!event) {
      event = await prisma.event.create({
        data: {
          title: 'Demo Event',
          description: 'A sample event created for seeding purposes.',
          date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // one week from now
          location: 'Online',
          capacity: 100,
          organizerId: user.id,
        },
      });
    }

    // Create a registration linking the user and event if it doesn't exist.
    const existingRegistration = await prisma.registration.findFirst({
      where: { userId: user.id, eventId: event.id },
    });

    if (!existingRegistration) {
      await prisma.registration.create({
        data: {
          userId: user.id,
          eventId: event.id,
        },
      });
    }

    console.log('✓ Seeding completed successfully!');
    console.log(`  - User: ${user.email}`);
    console.log(`  - Event: ${event.title} (id=${event.id})`);
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


