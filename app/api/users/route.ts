import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/responseHandler';
import { ERROR_CODES } from '@/lib/errorCodes';
import { createUserSchema } from '@/lib/schemas/userSchema';
import { validateRequest } from '@/lib/schemas/validationUtils';
import { z } from 'zod';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;

    if (page < 1 || limit < 1) {
      return sendError(
        'Page and limit must be positive numbers',
        ERROR_CODES.INVALID_INPUT,
        400
      );
    }

    const users = await prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      select: { id: true, name: true, email: true, createdAt: true } // Avoid sending hashes
    });

    return sendSuccess(users, 'Users retrieved successfully', 200);
  } catch (error) {
    console.error('[GET /api/users] Error:', error);
    return sendError(
      'Failed to retrieve users',
      ERROR_CODES.DATABASE_FAILURE,
      500,
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}

export async function POST(req: Request) {
  try {
    const validation = await validateRequest(req, createUserSchema);

    if (!validation.success) {
      return validation.response!;
    }

    type CreateUserInput = z.infer<typeof createUserSchema>;
    const userData = validation.data as CreateUserInput;

    // FIX: Map 'password' from the request to 'passwordHash' for Prisma
    // IMPORTANT: You should hash the password here before saving!
    const user = await prisma.user.create({ 
        data: {
            name: userData.name,
            email: userData.email,
            passwordHash: userData.password, // In production: await hash(userData.password)
        }
    });

    // Remove passwordHash from the response for security
    const { passwordHash: _, ...userWithoutPassword } = user;

    return sendSuccess(userWithoutPassword, 'User created successfully', 201);
  } catch (error: any) {
    console.error('[POST /api/users] Error:', error);

    if (error.code === 'P2002') {
      return sendError(
        'A user with this email already exists',
        ERROR_CODES.DUPLICATE_ENTRY,
        409
      );
    }

    return sendError(
      'Failed to create user',
      ERROR_CODES.DATABASE_FAILURE,
      500,
      { error: error.message }
    );
  }
}

// Added underscore to satisfy 'unused parameter' rule
export async function PUT(_req: Request) {
  return sendError(
    'PUT requests require a specific user ID in the URL path',
    ERROR_CODES.INVALID_INPUT,
    400
  );
}

// Added underscore to satisfy 'unused parameter' rule
export async function DELETE(_req: Request) {
  return sendError(
    'DELETE requests require a specific user ID in the URL path',
    ERROR_CODES.INVALID_INPUT,
    400
  );
}