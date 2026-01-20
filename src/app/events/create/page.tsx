'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventFormSchema, EventFormData } from '@/lib/schemas/eventSchema';
import FormInput from '@/components/ui/FormInput';

export default function CreateEventPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
  });

  const onSubmit = async (data: EventFormData) => {
    console.log('Form data:', data);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    alert('Event created successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Create New Event
          </h1>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                label="Title"
                name="title"
                register={register}
                error={errors.title}
                placeholder="Enter event title"
              />
              <FormInput
                label="Location"
                name="location"
                register={register}
                error={errors.location}
                placeholder="Enter event location"
              />
            </div>
            <FormInput
              label="Description"
              name="description"
              register={register}
              error={errors.description}
              placeholder="Enter event description"
              type="textarea"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormInput
                label="Date"
                name="date"
                register={register}
                error={errors.date}
                type="datetime-local"
              />
              <FormInput
                label="Start Time"
                name="startTime"
                register={register}
                error={errors.startTime}
                type="datetime-local"
              />
              <FormInput
                label="End Time"
                name="endTime"
                register={register}
                error={errors.endTime}
                type="datetime-local"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Event...' : 'Create Event'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
