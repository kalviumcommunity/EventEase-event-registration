// Simple seeding script for Prisma (CommonJS) — runnable with `node prisma/seed.js`.
// Uses a plain JS file to avoid adding extra TypeScript runtime deps.
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
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
  await prisma.registration.upsert({
    where: {
      // We don't have an id to upsert by, so use composite unique via prisma raw
      id: `${user.id}-${event.id}`,
    },
    update: {},
    create: {
      // Generate a deterministic id so this script is idempotent-ish
      id: `${user.id}-${event.id}`,
      userId: user.id,
      eventId: event.id,
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
