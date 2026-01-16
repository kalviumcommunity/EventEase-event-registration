import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only apply to API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Skip auth routes
  if (pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = authHeader.substring(7);
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { role } = decoded;

  // Check role-based access
  if (pathname.startsWith('/api/admin/') && role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // For /api/users/*, any authenticated user is allowed
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
