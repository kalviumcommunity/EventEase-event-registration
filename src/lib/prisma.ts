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
 *
 * ADVANCED: Performance Monitoring & Query Logging
 * ================================================
 * This configuration enables detailed query logging with performance metrics.
 * Use this for:
 * - Identifying slow queries and N+1 problems
 * - Benchmarking before/after optimization
 * - Monitoring production performance (in conjunction with proper log aggregation)
 *
 * Log Levels:
 *   - 'query':  Full SQL statements (includes parameters) - HIGH OVERHEAD
 *   - 'error':  Only error queries
 *   - 'warn':   Warnings and deprecated operations
 *   - 'info':   General informational messages
 *
 * Trade-off:
 * - ENABLE for development & performance analysis
 * - DISABLE in production for performance (use external APM instead)
 */

declare global {
  // Allow `globalThis.prisma` to be used to store the singleton instance.
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Performance monitoring middleware (optional, for advanced cases)
const enablePerformanceMonitoring = process.env.NODE_ENV !== 'production';

const prisma =
  global.prisma ??
  new PrismaClient({
    // Comprehensive logging for development & debugging
    log:
      process.env.NODE_ENV === 'production'
        ? ['error', 'warn'] // Minimal logging in production
        : [
            'query', // SQL statements with parameters
            'info', // General info messages
            'warn', // Warning messages
            'error', // Error messages
          ],

    // Optional: Custom error formatting for readability
    errorFormat: 'colorless',
  });

/**
 * ADVANCED: Middleware for query performance monitoring
 *
 * This middleware intercepts every Prisma operation and logs:
 * - Operation type (find, create, update, delete, etc.)
 * - Duration in milliseconds
 * - Target model
 *
 * Use Cases:
 * - Detect slow queries (threshold: > 100ms)
 * - Identify N+1 patterns (repeated queries in loops)
 * - Track performance regressions
 *
 * Cost: ~1-5% performance overhead; worth it for non-critical apps
 */
if (enablePerformanceMonitoring) {
  prisma.$use(async (params, next) => {
    const start = Date.now();
    const result = await next(params);
    const duration = Date.now() - start;

    // Log slow queries (threshold: 100ms)
    if (duration > 100) {
      console.warn(
        `[SLOW QUERY] ${params.model}.${params.action} took ${duration}ms`,
      );
    }

    return result;
  });
}

// Preserve the client across module reloads in development.
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma;

