import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth-tokens';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip auth routes and static files
  if (pathname.startsWith('/api/auth/') || pathname.startsWith('/_next/') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Get access token from cookies
  const accessToken = req.cookies.get('accessToken')?.value;

  if (!accessToken) {
    // No access token, redirect to login for pages, 401 for API
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', req.url));
  }

  const { role } = decoded;

  // Check admin routes
  if (pathname.startsWith('/api/admin/') && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Additional security for database-related routes
  if (pathname.startsWith('/api/db-test') && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden: Admin access required for database operations' }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/events/:path*', '/users/:path*'],
};
