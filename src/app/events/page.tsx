

export default async function EventsPage() {
  // Temporary 3-second delay to test Loading Skeleton
  await new Promise((res) => setTimeout(res, 3000));

  // Temporary condition to test Error Boundary (simulate failure)
  if (Math.random() > 0.7) {
    throw new Error('Failed to load events');
  }

  // Mock event data for demonstration
  const events = [
    { id: 1, title: 'Tech Conference 2024', date: '2024-10-15', location: 'San Francisco' },
    { id: 2, title: 'Music Festival', date: '2024-11-20', location: 'Los Angeles' },
    { id: 3, title: 'Art Exhibition', date: '2024-12-05', location: 'New York' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Upcoming Events</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{event.title}</h2>
              <p className="text-gray-600 mb-1">Date: {event.date}</p>
              <p className="text-gray-600">Location: {event.location}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
