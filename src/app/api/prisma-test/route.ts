import prisma from '../../../lib/prisma';

/**
 * Simple server-side test route to verify Prisma connectivity.
 * - Runs on the server (Next.js App Router API route).
 * - Fetches a small set of `Event` records and logs the outcome.
 *
 * Usage:
 * - Start the app, ensure DATABASE_URL is set in `.env.local`.
 * - Visit `/api/prisma-test` in the browser or use `curl` to hit the route.
 */

export async function GET() {
  try {
    // Fetch up to 10 events to exercise a simple read query.
    const events = await prisma.event.findMany({ take: 10 });

    // Log to the server console so you can verify connectivity.
    console.log('Prisma test: fetched events count =', events.length);

    return new Response(JSON.stringify({ success: true, count: events.length, events }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Prisma test error:', error);
    return new Response(JSON.stringify({ success: false, error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
