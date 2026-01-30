import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/requireAuth';
import prisma from '@/lib/prisma';

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List all users
 *     description: Retrieves a list of all registered users. Requires 'manage_users' permission.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Failed to fetch users
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user has manage_users permission
    await requireAuth(request, 'manage_users');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 },
    );
  }
}
