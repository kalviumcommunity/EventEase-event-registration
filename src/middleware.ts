import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth-tokens';
import { randomUUID } from 'crypto';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Generate unique request ID for correlation
  const requestId = req.headers.get('x-request-id') || randomUUID();

  // Skip auth routes and static files
  if (
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    // Still add request ID for non-auth routes
    const response = NextResponse.next();
    response.headers.set('x-request-id', requestId);
    return response;
  }

  // Get access token from cookies
  const accessToken = req.cookies.get('accessToken')?.value;

  if (!accessToken) {
    // No access token, redirect to login for pages, 401 for API
    if (pathname.startsWith('/api/')) {
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
      response.headers.set('x-request-id', requestId);
      return response;
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Verify access token
  let decoded;
  try {
    decoded = verifyAccessToken(accessToken);
  } catch {
    // Access token expired/invalid, redirect to login for pages, 401 for API
    if (pathname.startsWith('/api/')) {
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
      response.headers.set('x-request-id', requestId);
      return response;
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const { role } = decoded;

  // Check admin routes
  if (pathname.startsWith('/api/admin/') && role !== 'ADMIN') {
    const response = NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    response.headers.set('x-request-id', requestId);
    return response;
  }

  // Additional security for database-related routes
  if (pathname.startsWith('/api/db-test') && role !== 'ADMIN') {
    const response = NextResponse.json(
      { error: 'Forbidden: Admin access required for database operations' },
      { status: 403 },
    );
    response.headers.set('x-request-id', requestId);
    return response;
  }

  // For successful requests, add request ID to headers
  const response = NextResponse.next();
  response.headers.set('x-request-id', requestId);
  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard/:path*',
    '/events/:path*',
    '/users/:path*',
  ],
};
