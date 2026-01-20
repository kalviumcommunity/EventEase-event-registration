const { Client } = require('pg');

// Plain-SQL idempotent seed script using node-postgres.
// This is a fallback for local development when Prisma's runtime
// configuration prevents the generated client from initializing.

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error(
    'Please set DATABASE_URL environment variable (e.g. postgres://user:pass@localhost:5432/db)',
  );
  process.exit(1);
}

const client = new Client({ connectionString: databaseUrl });

async function main() {
  await client.connect();
  try {
    await client.query('BEGIN');

    // Upsert demo user by unique email
    const upsertUserSql = `
      INSERT INTO "User" (id, name, email, "passwordHash", role, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), $1, $2, $3, $4, now(), now())
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, "updatedAt" = now()
      RETURNING id, email;
    `;
    const userValues = ['Demo User', 'demo@events.local', 'demo-hash', 'USER'];
    const userRes = await client.query(upsertUserSql, userValues);
    const user = userRes.rows[0];

    // Find or create demo event for organizer
    const findEventSql = `SELECT id, title FROM "Event" WHERE title = $1 AND "organizerId" = $2 LIMIT 1`;
    const eventTitle = 'Demo Event';
    let eventRes = await client.query(findEventSql, [eventTitle, user.id]);
    let event;
    if (eventRes.rowCount === 0) {
      const createEventSql = `
        INSERT INTO "Event" (id, title, description, date, location, capacity, "organizerId", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, now(), now())
        RETURNING id, title;
      `;
      const date = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // one week
      const createVals = [
        eventTitle,
        'A sample event created for seeding purposes.',
        date.toISOString(),
        'Online',
        100,
        user.id,
      ];
      eventRes = await client.query(createEventSql, createVals);
      event = eventRes.rows[0];
    } else {
      event = eventRes.rows[0];
    }

    // Insert registration if missing (unique constraint on userId,eventId)
    const insertRegSql = `
      INSERT INTO "Registration" (id, "userId", "eventId")
      VALUES (gen_random_uuid(), $1, $2)
      ON CONFLICT ("userId", "eventId") DO NOTHING
      RETURNING id;
    `;
    const regRes = await client.query(insertRegSql, [user.id, event.id]);

    await client.query('COMMIT');

    console.log('\u2713 Seeding completed successfully!');
    console.log(`  - User: ${user.email}`);
    console.log(`  - Event: ${event.title} (id=${event.id})`);
    console.log(
      `  - Registration: ${regRes.rowCount > 0 ? 'created' : 'already existed'}`,
    );
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding failed:', err);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  main();
}
