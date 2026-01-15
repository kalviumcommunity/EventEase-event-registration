import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/events - List events with pagination and filtering
// Handles GET requests to list events with pagination and filtering options.
// Returns a JSON response with the list of events.
export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;
    const organizerId = searchParams.get('organizerId');
    const events = await prisma.event.findMany({
        where: organizerId ? { organizerId: Number(organizerId) } : {},
        skip: (page - 1) * limit,
        take: limit,
    });
    return NextResponse.json(events);
}

// POST /api/events - Create a new event
export async function POST(req) {
    const data = await req.json();
    const event = await prisma.event.create({ data });
    return NextResponse.json(event, { status: 201 });
}

// PUT /api/events/:id - Update an event
export async function PUT(req) {
    const { id } = req.query;
    const data = await req.json();
    const event = await prisma.event.update({
        where: { id: Number(id) },
        data,
    });
    return NextResponse.json(event);
}

// DELETE /api/events/:id - Delete an event
export async function DELETE(req) {
    const { id } = req.query;
    await prisma.event.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: 'Event deleted' });
}