import React from 'react';
import { render, screen } from '@testing-library/react';
import { EventCard } from '@/components/EventCard';

describe('EventCard', () => {
  it('renders the event title and date correctly', () => {
    const title = 'Sample Event';
    const date = '2023-10-15';

    render(<EventCard title={title} date={date} />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(title);
    expect(screen.getByText('Oct 15, 2023')).toBeInTheDocument();
  });

  it('renders the description when provided', () => {
    const title = 'Sample Event';
    const date = '2023-10-15';
    const description = 'This is a sample event description.';

    render(<EventCard title={title} date={date} description={description} />);

    expect(screen.getByText(description)).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const title = 'Sample Event';
    const date = '2023-10-15';

    render(<EventCard title={title} date={date} />);

    expect(screen.queryByText(/description/)).not.toBeInTheDocument();
  });
});
