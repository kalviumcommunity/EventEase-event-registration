import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/responseHandler';
import { hashPassword } from '@/lib/auth';
import { parseCreateUserRequest } from '@/lib/schemas/userSchema';
import { sanitize } from '@/lib/security';


/**
 * POST /api/auth/signup
 * Creates a new user account with hashed password.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input using Zod schema
    const validation = parseCreateUserRequest(body);
    if (!validation.success) {
      return sendError('Validation failed', 'VALIDATION_ERROR', 400, validation.error);
    }

    const { name, email, password } = validation.data;

    // Sanitize user-provided strings to prevent XSS
    const sanitizedData = {
      name: sanitize(name),
      email: sanitize(email),
    };

    // Check for duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return sendError('User with this email already exists', 'DUPLICATE_ENTRY', 409);
    }

    // Hash password using bcrypt
    const passwordHash = await hashPassword(password);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name: sanitizedData.name,
        email: sanitizedData.email,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // Send welcome email after successful user creation
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          firstName: name.split(' ')[0], // Extract first name
        }),
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the signup if email fails
    }

    // Return success response
    return sendSuccess(user, 'User created successfully', 201);
  } catch (error) {
    console.error('Signup error:', error);
    return sendError('Internal server error', 'INTERNAL_ERROR', 500);
  }
}
