import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/responseHandler';
import { comparePassword, signToken } from '@/lib/auth';

/**
 * POST /api/auth/login
 * Authenticates user credentials and returns a JWT token upon success.
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

    // Generate JWT token with user ID and email
    const token = signToken({ userId: user.id, email: user.email });

    // Return token in response
    return sendSuccess({ token }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return sendError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
