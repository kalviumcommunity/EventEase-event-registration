import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/registrations - List registrations with pagination and filtering
// Handles GET requests to list registrations with pagination and filtering options.
// Returns a JSON response with the list of registrations.
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const userId = searchParams.get('userId');
    const registrations = await prisma.registration.findMany({
        where: userId ? { userId: Number(userId) } : {},
        skip: (page - 1) * limit,
        take: limit,
    });
    return NextResponse.json(registrations);
}

// POST /api/registrations - Create a new registration
export async function POST(req) {
    const data = await req.json();
    const registration = await prisma.registration.create({ data });
    return NextResponse.json(registration, { status: 201 });
}

// PUT /api/registrations/:id - Update a registration
export async function PUT(req) {
    const { id } = req.query;
    const data = await req.json();
    const registration = await prisma.registration.update({
        where: { id: Number(id) },
        data,
    });
    return NextResponse.json(registration);
}

// DELETE /api/registrations/:id - Delete a registration
export async function DELETE(req) {
    const { id } = req.query;
    await prisma.registration.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: 'Registration deleted' });
}