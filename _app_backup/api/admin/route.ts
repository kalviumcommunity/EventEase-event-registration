import { NextRequest } from 'next/server';
import { sendSuccess } from '@/lib/responseHandler';

/**
 * GET /api/admin - Admin-only endpoint
 * Accessible only by users with ADMIN role.
 */
export async function GET(_req: NextRequest) {
  // Middleware ensures only ADMIN users reach here
  return sendSuccess(
    { message: 'Welcome to the admin panel' },
    'Admin access granted',
  );
}
