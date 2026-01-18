import React from 'react';
import { formatEventDate } from '@/lib/utils';

interface EventCardProps {
  title: string;
  date: Date | string;
  description?: string;
}

export const EventCard: React.FC<EventCardProps> = ({ title, date, description }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 border">
      <h2 className="text-xl font-bold mb-2" role="heading" aria-level={2}>
        {title}
      </h2>
      <p className="text-gray-600 mb-2" role="text">
        {formatEventDate(date)}
      </p>
      {description && (
        <p className="text-gray-800" role="text">
          {description}
        </p>
      )}
    </div>
  );
};
