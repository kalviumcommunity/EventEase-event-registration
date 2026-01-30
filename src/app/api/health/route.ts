/**
 * @swagger
 * /api/health:
 *   get:
 *     description: Returns system health status
 *     responses:
 *       200:
 *         description: System is healthy
 */
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { status: 'ok', uptime: process.uptime() },
    { status: 200 },
  );
}
