import { NextRequest } from 'next/server';
import { verifyAccessToken } from '@/lib/auth-tokens';
import { cookies } from 'next/headers';

export async function requireAuth(_request: NextRequest, requiredPermission?: string): Promise<{ userId: string; role: string }> {
  try {
    // Get access token from cookies
    const cookieStore = cookies();
    const accessToken = (await cookieStore).get('accessToken')?.value;

    if (!accessToken) {
      throw new Error('Unauthorized');
    }

    // Verify token and get user info
    const decoded = verifyAccessToken(accessToken);

    // Check permission if required
    if (requiredPermission && decoded.role !== 'admin') {
      // For now, only admin role has all permissions
      // In a real app, you'd check specific permissions
      throw new Error('Insufficient permissions');
    }

    return decoded;
  } catch (error) {
    throw new Error('Authentication failed');
  }
}
