import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user details
 *     description: Not implemented yet.
 *     responses:
 *       501:
 *         description: Not Implemented
 */
export async function GET() {
    return NextResponse.json({ error: 'Not Implemented' }, { status: 501 });
}
