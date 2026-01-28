import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
} from '@/lib/auth-tokens';

/**
 * POST /api/auth/refresh
 * Refreshes access and refresh tokens using the refresh token from cookies.
 * Implements token rotation for enhanced security.
 */
export async function POST(req: NextRequest) {
  try {
    // Get refresh token from cookies
    const refreshToken = req.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token not found' },
        { status: 401 },
      );
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid refresh token' },
        { status: 401 },
      );
    }

    const { userId } = decoded;

    // Check if user still exists and get their role
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Generate new tokens (token rotation)
    const newAccessToken = generateAccessToken(user.id, user.role);
    const newRefreshToken = generateRefreshToken(user.id);

    // Create response and set new cookies
    const response = NextResponse.json({
      message: 'Tokens refreshed successfully',
    });
    setAuthCookies(response, newAccessToken, newRefreshToken);

    // Log token rotation
    console.log(`Token rotation completed for user ${userId}`);

    return response;
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
