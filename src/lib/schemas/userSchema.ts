import { z } from 'zod';

/**
 * Why Zod for validation?
 * 
 * Zod is a TypeScript-first schema validation library that provides:
 * 1. Type Safety: Automatically generates TypeScript types from schemas
 * 2. Composability: Schemas can be reused and combined across client/server
 * 3. Explicitness: Validation rules are clear and centralized
 * 4. Error Messages: Built-in support for custom, user-friendly error messages
 * 5. Runtime Validation: Validates data at runtime (not just compile-time)
 * 
 * How schema reuse improves consistency:
 * - Backend uses the schema for request validation
 * - Frontend can use the same schema for form validation
 * - Shared validation reduces discrepancies between client and server
 * - Single source of truth for data requirements across the stack
 * 
 * How early validation improves API reliability:
 * - Prevents invalid data from reaching database layer
 * - Reduces try/catch complexity in route handlers
 * - Returns structured error responses with field-level details
 * - Saves database queries by catching errors before processing
 */

/**
 * Base user schema for creation and updates
 * Defines strict validation rules for all user data
 */
export const userBaseSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long' })
    .max(100, { message: 'Name must not exceed 100 characters' })
    .trim(),
  email: z
    .string()
    .email({ message: 'Please provide a valid email address' })
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters long' })
    .regex(/[A-Z]/, {
      message: 'Password must contain at least one uppercase letter',
    })
    .regex(/[a-z]/, {
      message: 'Password must contain at least one lowercase letter',
    })
    .regex(/[0-9]/, {
      message: 'Password must contain at least one number',
    }),
});

/**
 * Schema for POST /api/users (user creation)
 * All fields are required
 */
export const createUserSchema = userBaseSchema;

/**
 * Schema for PUT /api/users/:id (user update)
 * All fields are optional to allow partial updates
 */
export const updateUserSchema = userBaseSchema.partial();

/**
 * Schema for user response (when returning user data)
 * Includes computed fields like id and timestamps
 */
export const userResponseSchema = userBaseSchema.extend({
  id: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

/**
 * Type exports for TypeScript
 * These types can be used in frontend forms or type definitions
 * Example usage in a form component:
 * ```tsx
 * type UserFormData = z.infer<typeof createUserSchema>;
 * const form = useForm<UserFormData>();
 * ```
 */
export type CreateUserRequest = z.infer<typeof createUserSchema>;
export type UpdateUserRequest = z.infer<typeof updateUserSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;

/**
 * Helper function to parse and validate user creation requests
 * Returns { success: true, data } or { success: false, errors }
 * 
 * Usage in route handler:
 * ```ts
 * const parsed = parseCreateUserRequest(await req.json());
 * if (!parsed.success) {
 *   return handleValidationErrors(parsed.errors);
 * }
 * const user = await prisma.user.create({ data: parsed.data });
 * ```
 */
export function parseCreateUserRequest(data: unknown) {
  return createUserSchema.safeParse(data);
}

export function parseUpdateUserRequest(data: unknown) {
  return updateUserSchema.safeParse(data);
}
