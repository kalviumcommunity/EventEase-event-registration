import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/responseHandler';
import { comparePassword } from '@/lib/auth';
import { generateAccessToken, generateRefreshToken, setAuthCookies } from '@/lib/auth-tokens';

/**
 * POST /api/auth/login
 * Authenticates user credentials and sets JWT cookies upon success.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validate required fields
    if (!email || !password) {
      return sendError('Email and password are required', 'VALIDATION_ERROR', 400);
    }

    // Fetch user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return sendError('Invalid credentials', 'INVALID_CREDENTIALS', 401);
    }

    // Verify password using bcrypt comparison
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return sendError('Invalid credentials', 'INVALID_CREDENTIALS', 401);
    }

    // Generate access and refresh tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    // Create response and set cookies
    const response = sendSuccess({ message: 'Login successful' });
    setAuthCookies(response, accessToken, refreshToken);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return sendError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
