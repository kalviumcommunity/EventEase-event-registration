import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/responseHandler';
import { ERROR_CODES } from '@/lib/errorCodes';
import { updateUserSchema, UpdateUserRequest } from '@/lib/schemas/userSchema';
import { validateRequest } from '@/lib/schemas/validationUtils';
import { sanitize } from '@/lib/security';
import { verifyAccessToken } from '@/lib/auth-tokens';
import { cookies } from 'next/headers';

export async function PUT(req: Request) {
  try {
    // Get access token from cookies
    const cookieStore = cookies();
    const accessToken = (await cookieStore).get('accessToken')?.value;

    if (!accessToken) {
      return sendError('Unauthorized', ERROR_CODES.UNAUTHORIZED, 401);
    }

    // Verify token and get user ID
    let decoded;
    try {
      decoded = verifyAccessToken(accessToken);
    } catch {
      return sendError('Invalid token', ERROR_CODES.UNAUTHORIZED, 401);
    }

    const userId = decoded.userId;

    const validation = await validateRequest(req, updateUserSchema);

    if (!validation.success) {
      return validation.response!;
    }

    const data = validation.data as UpdateUserRequest;

    // Sanitize user-provided strings to prevent XSS
    const sanitizedData: any = {};
    if (data.name) sanitizedData.name = sanitize(data.name);
    if (data.email) sanitizedData.email = sanitize(data.email);
    if (data.password) sanitizedData.passwordHash = data.password; // In production: hash the password

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: sanitizedData,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return sendSuccess(updatedUser, 'Profile updated successfully', 200);
  } catch (error: any) {
    console.error('[PUT /api/profile] Error:', error);

    if (error.code === 'P2025') {
      return sendError('User not found', ERROR_CODES.NOT_FOUND, 404);
    }

    if (error.code === 'P2002') {
      return sendError(
        'Email already in use',
        ERROR_CODES.DUPLICATE_ENTRY,
        409,
      );
    }

    return sendError(
      'Failed to update profile',
      ERROR_CODES.DATABASE_FAILURE,
      500,
      { error: error.message },
    );
  }
}
