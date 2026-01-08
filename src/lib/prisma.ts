import { PrismaClient } from '@prisma/client';

/**
 * Prisma client singleton for Next.js (App Router) compatibility.
 *
 * Why a singleton?
 * - In development Next.js may reload modules frequently which can create
 *   multiple `PrismaClient` instances and exhaust database connections.
 * - Attaching the client to `globalThis` ensures only one instance exists
 *   during the Node.js process lifetime.
 *
 * How Prisma connects to PostgreSQL:
 * - Prisma reads the connection string from the `DATABASE_URL` environment
 *   variable (we configure this in `prisma.config.ts` and `.env.local`).
 * - The Prisma Client uses that connection to run queries against Postgres.
 *
 * Type safety:
 * - Prisma generates a typed client (`@prisma/client`) from the schema.
 * - This provides full TypeScript inference for models and queries.
 */

declare global {
  // Allow `globalThis.prisma` to be used to store the singleton instance.
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma ?? new PrismaClient({
  // Enable rich logging for development and diagnostics.
  log: ['query', 'info', 'warn', 'error'],
});

// Preserve the client across module reloads in development.
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;
