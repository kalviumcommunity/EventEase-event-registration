import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/users - List users with pagination and filtering
// Handles GET requests to list users with pagination and filtering options.
// Returns a JSON response with the list of users.
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const users = await prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
    });
    return NextResponse.json(users);
}

// POST /api/users - Create a new user
export async function POST(req) {
    const data = await req.json();
    const user = await prisma.user.create({ data });
    return NextResponse.json(user, { status: 201 });
}

// PUT /api/users/:id - Update a user
export async function PUT(req) {
    const { id } = req.query;
    const data = await req.json();
    const user = await prisma.user.update({
        where: { id: Number(id) },
        data,
    });
    return NextResponse.json(user);
}

// DELETE /api/users/:id - Delete a user
export async function DELETE(req) {
    const { id } = req.query;
    await prisma.user.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: 'User deleted' });
}