-- Seed script for EventEase database using raw SQL
-- Run with: psql -U eventease -d eventease_db -f prisma/seed.sql

-- Insert demo user
INSERT INTO "User" (id, name, email, "passwordHash", role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'Demo User',
  'demo@events.local',
  'demo-hash',
  'USER',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Get the demo user's ID
WITH demo_user AS (
  SELECT id FROM "User" WHERE email = 'demo@events.local'
)
-- Insert demo event
INSERT INTO "Event" (id, title, description, date, location, capacity, "organizerId", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  'Demo Event',
  'A sample event created for seeding purposes.',
  NOW() + INTERVAL '7 days',
  'Online',
  100,
  demo_user.id,
  NOW(),
  NOW()
FROM demo_user
WHERE NOT EXISTS (
  SELECT 1 FROM "Event" WHERE title = 'Demo Event'
);

-- Get the demo event's ID and create a registration
WITH demo_user AS (
  SELECT id FROM "User" WHERE email = 'demo@events.local'
),
demo_event AS (
  SELECT id FROM "Event" WHERE title = 'Demo Event' AND "organizerId" = (SELECT id FROM demo_user)
)
INSERT INTO "Registration" (id, "userId", "eventId", "createdAt")
SELECT
  gen_random_uuid(),
  demo_user.id,
  demo_event.id,
  NOW()
FROM demo_user, demo_event
WHERE NOT EXISTS (
  SELECT 1 FROM "Registration"
  WHERE "userId" = demo_user.id AND "eventId" = demo_event.id
);
