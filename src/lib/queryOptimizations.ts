import { PrismaClient } from '@prisma/client';

export async function getUpcomingEventsOptimized(prisma: PrismaClient) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);

  return prisma.event.findMany({
    where: {
      date: {
        gte: new Date(),
        lte: futureDate,
      },
    },
    select: {
      id: true,
      title: true,
      date: true,
      location: true,
      capacity: true,
      _count: {
        select: { registrations: true },
      },
    },
    orderBy: { date: 'asc' },
  });
}

export async function getEventsPaginated(
  prisma: PrismaClient,
  pageNumber: number = 1,
  pageSize: number = 20,
) {
  const page = Math.max(1, pageNumber);
  const size = Math.min(100, Math.max(1, pageSize));
  const skip = (page - 1) * size;

  const [events, totalCount] = await Promise.all([
    prisma.event.findMany({
      select: {
        id: true,
        title: true,
        date: true,
        location: true,
        capacity: true,
      },
      orderBy: { date: 'asc' },
      skip,
      take: size,
    }),
    prisma.event.count(),
  ]);

  const totalPages = Math.ceil(totalCount / size);

  return {
    events,
    pagination: {
      currentPage: page,
      pageSize: size,
      totalRecords: totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export async function getOrganizerEventsWithRegistrations(
  prisma: PrismaClient,
  organizerId: string,
) {
  return prisma.event.findMany({
    where: { organizerId },
    select: {
      id: true,
      title: true,
      date: true,
      capacity: true,
      registrations: {
        select: {
          id: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: { registrations: true },
      },
    },
  });
}

export async function bulkCreateUsers(
  prisma: PrismaClient,
  userData: Array<{
    name: string;
    email: string;
    passwordHash: string;
  }>,
) {
  const result = await prisma.user.createMany({
    data: userData,
    skipDuplicates: true,
  });

  return {
    created: result.count,
    skipped: userData.length - result.count,
  };
}

export async function bulkUpdateEventDates(
  prisma: PrismaClient,
  eventIds: string[],
  daysToAdd: number,
) {
  const newDate = new Date();
  newDate.setDate(newDate.getDate() + daysToAdd);

  const result = await prisma.event.updateMany({
    where: {
      id: { in: eventIds },
    },
    data: {
      date: newDate,
    },
  });

  return {
    updated: result.count,
  };
}

export async function getAvailableEventsWithMinRegistrations(
  prisma: PrismaClient,
  organizerId: string,
  minRegistrations: number = 5,
) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 60);

  const events = await prisma.event.findMany({
    where: {
      organizerId,
      date: {
        gte: new Date(),
        lte: futureDate,
      },
      capacity: { gt: 0 },
    },
    select: {
      id: true,
      title: true,
      date: true,
      capacity: true,
      _count: { select: { registrations: true } },
    },
  });

  const filtered = events.filter(
    (event) => event._count.registrations >= minRegistrations,
  );

  return {
    total: events.length,
    filteredByMinRegistrations: filtered.length,
    events: filtered,
  };
}

export async function getUniqueOrganizers(prisma: PrismaClient) {
  return prisma.event.findMany({
    distinct: ['organizerId'],
    select: { organizerId: true },
  });
}

export async function getEventSafely(prisma: PrismaClient, eventId: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        date: true,
        location: true,
        capacity: true,
        _count: { select: { registrations: true } },
      },
    });

    if (!event) {
      return { success: false, error: 'Event not found', data: null };
    }

    return { success: true, data: event };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Database error';
    console.error('[Query Error] getEventSafely:', errorMessage);
    return { success: false, error: errorMessage, data: null };
  }
}

export async function getUserProfileWithEvents(
  prisma: PrismaClient,
  userId: string,
) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      events: {
        select: {
          id: true,
          title: true,
          date: true,
          capacity: true,
        },
        orderBy: { date: 'asc' },
        take: 10,
      },
      registrations: {
        select: {
          id: true,
          createdAt: true,
          event: {
            select: {
              id: true,
              title: true,
              date: true,
              location: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
}
