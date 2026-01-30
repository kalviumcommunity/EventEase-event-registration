import { NextResponse } from 'next/server';

/**
 * @swagger
 * /api/upload/sas:
 *   get:
 *     summary: Get SAS token
 *     description: Not implemented yet.
 *     responses:
 *       501:
 *         description: Not Implemented
 */
export async function GET() {
    return NextResponse.json({ error: 'Not Implemented' }, { status: 501 });
}
