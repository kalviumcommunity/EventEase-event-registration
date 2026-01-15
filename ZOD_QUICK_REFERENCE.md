# Zod Validation Quick Reference

## File Structure

```
src/lib/
  schemas/
    ├── userSchema.ts           # User validation rules
    ├── eventSchema.ts          # Event validation rules
    └── validationUtils.ts      # Validation utilities & helpers
```

---

## Quick Schema Reference

### User Schema

```typescript
// Import schemas and types
import {
  createUserSchema,          // For POST /api/users
  updateUserSchema,          // For PUT /api/users/:id
  userResponseSchema,        // For response validation
  type CreateUserRequest,    // TypeScript type for new users
  type UpdateUserRequest,    // TypeScript type for updates
  type UserResponse,         // TypeScript type for responses
  parseCreateUserRequest,    // Helper function to parse/validate
  parseUpdateUserRequest,    // Helper function to parse/validate
} from '@/lib/schemas/userSchema';

// Validation Rules:
// - name: 2-100 chars, trimmed
// - email: valid email, lowercase, trimmed
// - password: 8+ chars, uppercase, lowercase, number
```

### Event Schema

```typescript
// Import schemas and types
import {
  createEventSchema,         // For POST /api/events
  updateEventSchema,         // For PUT /api/events/:id
  eventResponseSchema,       // For response validation
  type CreateEventRequest,   // TypeScript type for new events
  type UpdateEventRequest,   // TypeScript type for updates
  type EventResponse,        // TypeScript type for responses
  parseCreateEventRequest,   // Helper function to parse/validate
  parseUpdateEventRequest,   // Helper function to parse/validate
} from '@/lib/schemas/eventSchema';

// Validation Rules:
// - title: 3-200 chars, trimmed
// - description: 0-2000 chars, optional, trimmed
// - date: ISO 8601 datetime, must be future
// - location: 2-200 chars, trimmed
// - capacity: 1-100,000, integer
// - organizerId: positive integer (FK)
```

---

## Common Patterns

### Pattern 1: Validate Request in Route Handler

```typescript
import { validateRequest } from '@/lib/schemas/validationUtils';
import { createUserSchema } from '@/lib/schemas/userSchema';
import { sendSuccess, sendError } from '@/lib/responseHandler';

export async function POST(req: Request) {
  try {
    // Validate request body
    const validation = await validateRequest(req, createUserSchema);
    
    if (!validation.success) {
      return validation.response;  // HTTP 400 with errors
    }
    
    // Data is fully typed and validated
    const user = await prisma.user.create({ data: validation.data });
    return sendSuccess(user, 'User created', 201);
  } catch (error) {
    return sendError('Database error', 'DATABASE_FAILURE', 500);
  }
}
```

### Pattern 2: Use Helper Functions for Parsing

```typescript
import { parseCreateUserRequest } from '@/lib/schemas/userSchema';

const parsed = parseCreateUserRequest(await req.json());

if (!parsed.success) {
  // parsed.error contains validation errors
  const errors = parsed.error.errors;
}
```

### Pattern 3: Validate Data Before Database Operation

```typescript
import { validateData } from '@/lib/schemas/validationUtils';
import { createEventSchema } from '@/lib/schemas/eventSchema';

const validation = validateData(eventData, createEventSchema);

if (!validation.success) {
  return validation.response;  // HTTP 400
}

// Proceed with database operation
const event = await prisma.event.create({ data: validation.data });
```

### Pattern 4: Use TypeScript Types in Frontend

```typescript
import { type CreateUserRequest } from '@/lib/schemas/userSchema';

// Form data is fully typed
const formData: CreateUserRequest = {
  name: 'John',
  email: 'john@example.com',
  password: 'SecurePass123',
};

// Errors caught at compile time
formData.invalidField;  // ❌ TypeScript error
```

---

## HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| **201** | Created | User/Event created successfully |
| **400** | Bad Request | Validation error or invalid JSON |
| **400** | Bad Request | Foreign key constraint failed |
| **409** | Conflict | Duplicate email or title |
| **500** | Server Error | Database connection failure |

---

## Error Response Structure

**On Validation Error (HTTP 400):**
```json
{
  "success": false,
  "message": "Validation Error",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "errors": [
        {
          "field": "email",
          "message": "Please provide a valid email address",
          "code": "invalid_string"
        }
      ]
    }
  },
  "timestamp": "2026-01-15T10:30:00.123Z"
}
```

**Extract errors in frontend:**
```typescript
const response = await fetch('/api/users', { method: 'POST', body });
const data = await response.json();

if (!data.success) {
  const errors = data.error.details.errors;  // Array of error objects
  errors.forEach(err => {
    console.log(`${err.field}: ${err.message}`);
  });
}
```

---

## TypeScript Types (Auto-Generated)

### User Types
```typescript
// From createUserSchema
type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
};

// From updateUserSchema
type UpdateUserRequest = {
  name?: string;
  email?: string;
  password?: string;
};

// From userResponseSchema
type UserResponse = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};
```

### Event Types
```typescript
// From createEventSchema
type CreateEventRequest = {
  title: string;
  description?: string;
  date: string;
  location: string;
  capacity: number;
  organizerId: number;
};

// From updateEventSchema
type UpdateEventRequest = {
  title?: string;
  description?: string;
  location?: string;
  capacity?: number;
};

// From eventResponseSchema
type EventResponse = {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  organizerId: number;
  registrationCount: number;
  createdAt: string;
  updatedAt: string;
};
```

---

## Common Validation Errors

### Name Validation
```
"Name must be at least 2 characters long"
"Name must not exceed 100 characters"
```

### Email Validation
```
"Please provide a valid email address"
"test@" ❌ Invalid format
"user@domain" ❌ Missing TLD
"user@domain.com" ✅ Valid
```

### Password Validation
```
"Password must be at least 8 characters long"
"password123" ❌ No uppercase
"PASSWORD123" ❌ No lowercase
"Password123" ✅ Valid
```

### Date Validation
```
"Date must be a valid ISO 8601 datetime string"
"2026-01-15T10:00:00Z" ✅ Valid
"2025-01-15T10:00:00Z" ❌ Date must be in future

// Valid ISO 8601 formats:
"2026-03-15T10:00:00Z"
"2026-03-15T10:00:00+00:00"
"2026-03-15T10:00:00"
```

### Event Capacity Validation
```
"Capacity must be at least 1"
"Capacity cannot exceed 100,000"
0 ❌ Too small
1 ✅ Minimum valid
100000 ✅ Maximum valid
100001 ❌ Too large
```

---

## Testing Validation Schemas

### Unit Test Example
```typescript
import { describe, it, expect } from 'vitest';
import { createUserSchema } from '@/lib/schemas/userSchema';

describe('userSchema', () => {
  it('accepts valid user data', () => {
    const data = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123',
    };
    const result = createUserSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const data = {
      name: 'John Doe',
      email: 'invalid-email',
      password: 'SecurePass123',
    };
    const result = createUserSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('requires minimum 2 char name', () => {
    const data = {
      name: 'J',
      email: 'john@example.com',
      password: 'SecurePass123',
    };
    const result = createUserSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
```

---

## Extending Schemas

### Add New Field
```typescript
// Add phone number validation
export const createUserSchema = userBaseSchema.extend({
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
});
```

### Combine Schemas
```typescript
// Merge user and profile data
const createUserWithProfileSchema = createUserSchema.merge(
  profileSchema
);
```

### Make Fields Optional
```typescript
// Allow partial updates
const updateUserSchema = createUserSchema.partial();
```

### Remove Fields
```typescript
// Can't change email during update
const updateUserSchema = createUserSchema
  .partial()
  .omit({ email: true });
```

---

## Performance Considerations

✅ **Best Practices:**
- Validate early in route handler (before database queries)
- Use `.safeParse()` for error handling without exceptions
- Reuse schemas across endpoints
- Cache schema parsing results if needed

❌ **Avoid:**
- Validating after database operation (wasted query)
- Using try/catch for validation errors (use `.safeParse()`)
- Duplicate schema definitions (violates DRY)

---

## Related Files

- [Full Validation Documentation](./ZOD_VALIDATION_GUIDE.md)
- [User Schema](./src/lib/schemas/userSchema.ts)
- [Event Schema](./src/lib/schemas/eventSchema.ts)
- [Validation Utils](./src/lib/schemas/validationUtils.ts)
- [Users API](./app/api/users/route.ts)
- [Events API](./app/api/events/route.ts)
- [Response Handler](./src/lib/responseHandler.ts)

---

## Support

For issues or questions about Zod validation:

1. Check [Zod Documentation](https://zod.dev)
2. Review schema files for examples
3. Check API route implementations for usage patterns
4. Run TypeScript compilation for type checking: `npm run build`
5. Test with cURL commands in validation guide

---

**Last Updated**: January 15, 2026  
**Framework**: Next.js 16 with App Router  
**Library**: Zod v3
