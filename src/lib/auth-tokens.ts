import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { env } from './env';

const JWT_ACCESS_SECRET = env.JWT_SECRET!;
const JWT_REFRESH_SECRET = env.JWT_REFRESH_SECRET!;

export interface AccessTokenPayload {
  userId: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
}

/**
 * Generates an access token with userId and role, expires in 15 minutes.
 */
export function generateAccessToken(userId: string, role: string): string {
  const payload: AccessTokenPayload = { userId, role };
  return jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '15m' });
}

/**
 * Generates a refresh token with userId, expires in 7 days.
 */
export function generateRefreshToken(userId: string): string {
  const payload: RefreshTokenPayload = { userId };
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

/**
 * Verifies an access token and returns the payload.
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET) as jwt.JwtPayload &
      AccessTokenPayload;
    return decoded;
  } catch (_error) {
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verifies a refresh token and returns the payload.
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as jwt.JwtPayload &
      RefreshTokenPayload;
    return decoded;
  } catch (_error) {
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Sets HTTP-only, Secure, SameSite=Lax cookies for access and refresh tokens.
 */
export function setAuthCookies(
  res: NextResponse,
  accessToken: string,
  refreshToken: string,
): void {
  res.cookies.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes
    path: '/',
  });

  res.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

/**
 * Clears the auth cookies.
 */
export function clearAuthCookies(res: NextResponse): void {
  res.cookies.set('accessToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  res.cookies.set('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
}
