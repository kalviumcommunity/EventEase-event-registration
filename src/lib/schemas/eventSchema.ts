import { z } from 'zod';


export const eventBaseSchema = z.object({
  title: z
    .string()
    .min(3, { message: 'Event title must be at least 3 characters long' })
    .max(200, { message: 'Event title must not exceed 200 characters' })
    .trim(),
  description: z
    .string()
    .max(2000, { message: 'Description must not exceed 2000 characters' })
    .trim()
    .optional()
    .default(''),
  date: z
    .string()
    .datetime({ message: 'Date must be a valid ISO 8601 datetime string' })
    .refine(
      (date) => new Date(date) > new Date(),
      { message: 'Event date must be in the future' }
    ),
  location: z
    .string()
    .min(2, { message: 'Location must be at least 2 characters long' })
    .max(200, { message: 'Location must not exceed 200 characters' })
    .trim(),
  capacity: z
    .number()
    .int({ message: 'Capacity must be a whole number' })
    .min(1, { message: 'Capacity must be at least 1' })
    .max(100000, { message: 'Capacity cannot exceed 100,000' }),
});

/**
 * Schema for POST /api/events (event creation)
 * Requires organizerId to link event to user
 */
export const createEventSchema = eventBaseSchema.extend({
  organizerId: z
    .number()
    .int({ message: 'Organization ID must be a valid integer' })
    .positive({ message: 'Organization ID must be positive' }),
});

/**
 * Schema for PUT /api/events/:id (event update)
 * All fields are optional to allow partial updates
 * organizerId cannot be changed (immutable)
 */
export const updateEventSchema = eventBaseSchema.partial().omit({ date: true }).extend({
  date: z
    .string()
    .datetime({ message: 'Date must be a valid ISO 8601 datetime string' })
    .refine(
      (date) => new Date(date) > new Date(),
      { message: 'Event date must be in the future' }
    )
    .optional(),
});

/**
 * Schema for event response (when returning event data)
 * Includes computed fields like id and timestamps
 */
export const eventResponseSchema = createEventSchema.extend({
  id: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  registrationCount: z.number().int().min(0),
});

/**
 * Type exports for TypeScript
 * These types can be used in frontend components or type definitions
 * Example usage in a React component:
 * ```tsx
 * type EventFormData = z.infer<typeof createEventSchema>;
 * 
 * const EventForm: React.FC = () => {
 *   const [data, setData] = useState<EventFormData>({
 *     title: '',
 *     description: '',
 *     // ... other fields
 *   });
 * }
 * ```
 */
export type CreateEventRequest = z.infer<typeof createEventSchema>;
export type UpdateEventRequest = z.infer<typeof updateEventSchema>;
export type EventResponse = z.infer<typeof eventResponseSchema>;

/**
 * Helper functions to parse and validate event requests
 * Returns { success: true, data } or { success: false, errors }
 * 
 * Usage in route handler:
 * ```ts
 * const parsed = parseCreateEventRequest(await req.json());
 * if (!parsed.success) {
 *   return handleValidationErrors(parsed.errors);
 * }
 * const event = await prisma.event.create({ data: parsed.data });
 * ```
 */
export function parseCreateEventRequest(data: unknown) {
  return createEventSchema.safeParse(data);
}

export function parseUpdateEventRequest(data: unknown) {
  return updateEventSchema.safeParse(data);
}
