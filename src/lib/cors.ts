import { NextRequest, NextResponse } from 'next/server';

export function corsHandler(req: NextRequest) {
  const origin = req.headers.get('origin');

  // Allow requests from production domain and localhost:3000 during development
  const allowedOrigins = [
    'http://localhost:3000', // Development
    process.env.NEXT_PUBLIC_APP_URL || 'https://your-production-domain.com', // Production
  ];

  const isAllowedOrigin = allowedOrigins.includes(origin || '');

  if (!isAllowedOrigin) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  // Set CORS headers
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', origin || '');
  response.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS',
  );
  response.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization',
  );
  response.headers.set('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { status: 200, headers: response.headers });
  }

  return response;
}
