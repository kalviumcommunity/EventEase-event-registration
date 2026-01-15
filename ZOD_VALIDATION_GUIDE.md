# Zod Request Validation Documentation

## Overview

This document describes the Zod-based request validation system integrated into EventEase, a Next.js TypeScript project with Prisma PostgreSQL integration.

**Project**: EventEase  
**Framework**: Next.js 16 with App Router  
**ORM**: Prisma  
**Database**: PostgreSQL  
**Validation Library**: Zod v3  
**Documentation Date**: January 15, 2026

---

## Why Zod for Request Validation?

### 1. **Type Safety at Runtime**
- TypeScript only validates at compile-time; Zod validates at runtime
- Generates TypeScript types from schemas automatically
- Catch invalid data before it reaches your database layer

### 2. **Composability & Reuse**
- Define schemas once, use everywhere (backend routes, frontend forms, seed scripts)
- Reduced code duplication across client and server
- Single source of truth for data requirements

### 3. **Developer Experience**
- Clear, declarative validation rules
- Custom, user-friendly error messages per field
- Automatic error aggregation with structured format

### 4. **Performance**
- Early validation prevents unnecessary database queries
- Reduces database load from malformed requests
- Consistent response times regardless of invalid input volume

### 5. **Maintainability**
- Validation logic centralized in schema files
- Change rules once, affects all endpoints
- Easy to extend with new constraints

---

## Schemas Created

### 1. **User Schema** (`src/lib/schemas/userSchema.ts`)

#### Validation Rules:
| Field | Type | Rules | Example |
|-------|------|-------|---------|
| `name` | String | Min 2 chars, Max 100 chars, trimmed | "John Doe" |
| `email` | String | Valid email format, lowercased, trimmed | "john@example.com" |
| `password` | String | Min 8 chars, 1 uppercase, 1 lowercase, 1 number | "SecurePass123" |

#### Exported Schemas:
```typescript
// Create new user
createUserSchema: z.object({ name, email, password })

// Update existing user (all fields optional)
updateUserSchema: z.object({ name?, email?, password? })

// User response with metadata
userResponseSchema: z.object({ id, name, email, ..., createdAt, updatedAt })
```

#### Type Exports:
```typescript
type CreateUserRequest = z.infer<typeof createUserSchema>;
type UpdateUserRequest = z.infer<typeof updateUserSchema>;
type UserResponse = z.infer<typeof userResponseSchema>;
```

#### Helper Functions:
```typescript
parseCreateUserRequest(data: unknown)  // Parse and validate
parseUpdateUserRequest(data: unknown)  // Parse and validate
```

---

### 2. **Event Schema** (`src/lib/schemas/eventSchema.ts`)

#### Validation Rules:
| Field | Type | Rules | Example |
|-------|------|-------|---------|
| `title` | String | Min 3 chars, Max 200 chars, trimmed | "Tech Conference 2026" |
| `description` | String | Max 2000 chars, optional, trimmed | "Join us for insights..." |
| `date` | ISO 8601 String | Valid datetime, must be future date | "2026-03-15T10:00:00Z" |
| `location` | String | Min 2 chars, Max 200 chars, trimmed | "Silicon Valley Convention Center" |
| `capacity` | Number | Integer, Min 1, Max 100,000 | 500 |
| `organizerId` | Number | Positive integer (FK constraint) | 42 |

#### Exported Schemas:
```typescript
// Create new event (includes organizerId)
createEventSchema: z.object({ title, description?, date, location, capacity, organizerId })

// Update existing event (all optional, date immutable)
updateEventSchema: z.object({ title?, description?, location?, capacity? })

// Event response with metadata
eventResponseSchema: z.object({ ..., id, createdAt, updatedAt, registrationCount })
```

#### Type Exports:
```typescript
type CreateEventRequest = z.infer<typeof createEventSchema>;
type UpdateEventRequest = z.infer<typeof updateEventSchema>;
type EventResponse = z.infer<typeof eventResponseSchema>;
```

#### Helper Functions:
```typescript
parseCreateEventRequest(data: unknown)   // Parse and validate
parseUpdateEventRequest(data: unknown)   // Parse and validate
```

---

## Validation Utilities (`src/lib/schemas/validationUtils.ts`)

### Core Functions:

#### `validateRequest<T>(req: Request, schema: ZodSchema<T>)`
Validates incoming HTTP request body against a Zod schema.

**Usage in Route Handler:**
```typescript
import { validateRequest } from '@/lib/schemas/validationUtils';
import { createUserSchema } from '@/lib/schemas/userSchema';

export async function POST(req: Request) {
  const validation = await validateRequest(req, createUserSchema);
  
  if (!validation.success) {
    return validation.response;  // Returns HTTP 400 with error details
  }
  
  // validation.data is fully typed and validated
  const user = await prisma.user.create({ data: validation.data });
  return sendSuccess(user, 'User created', 201);
}
```

#### `validateData<T>(data: unknown, schema: ZodSchema<T>)`
Validates arbitrary data object (not from HTTP request).

**Usage Example:**
```typescript
import { validateData } from '@/lib/schemas/validationUtils';

const result = validateData(formData, createUserSchema);
if (!result.success) {
  // Handle validation errors
}
```

#### `formatZodErrors(zodError: ZodError)`
Formats Zod validation errors for logging or display.

---

## API Integration Examples

### 1. **POST /api/users - Create User**

#### Code:
```typescript
import { validateRequest } from '@/lib/schemas/validationUtils';
import { createUserSchema } from '@/lib/schemas/userSchema';

export async function POST(req: Request) {
  try {
    // Validate request body
    const validation = await validateRequest(req, createUserSchema);
    
    if (!validation.success) {
      return validation.response!;  // HTTP 400 with structured errors
    }
    
    // Create user (data is fully validated)
    const user = await prisma.user.create({ data: validation.data });
    return sendSuccess(user, 'User created successfully', 201);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return sendError('Email already exists', ERROR_CODES.DUPLICATE_ENTRY, 409);
    }
    return sendError('Failed to create user', ERROR_CODES.DATABASE_FAILURE, 500);
  }
}
```

#### Success Response (HTTP 201):
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-01-15T10:30:00Z",
    "updatedAt": "2026-01-15T10:30:00Z"
  },
  "timestamp": "2026-01-15T10:30:00.123Z"
}
```

#### Validation Error Response (HTTP 400):
```json
{
  "success": false,
  "message": "Validation Error",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "errors": [
        {
          "field": "name",
          "message": "Name must be at least 2 characters long",
          "code": "too_small"
        },
        {
          "field": "email",
          "message": "Please provide a valid email address",
          "code": "invalid_string"
        },
        {
          "field": "password",
          "message": "Password must contain at least one uppercase letter",
          "code": "custom"
        }
      ]
    }
  },
  "timestamp": "2026-01-15T10:30:00.123Z"
}
```

#### Duplicate Entry Response (HTTP 409):
```json
{
  "success": false,
  "message": "A user with this email already exists",
  "error": {
    "code": "DUPLICATE_ENTRY",
    "details": null
  },
  "timestamp": "2026-01-15T10:30:00.123Z"
}
```

---

### 2. **POST /api/events - Create Event**

#### Code:
```typescript
import { validateRequest } from '@/lib/schemas/validationUtils';
import { createEventSchema } from '@/lib/schemas/eventSchema';

export async function POST(req: Request) {
  try {
    // Validate against event creation schema
    const validation = await validateRequest(req, createEventSchema);
    
    if (!validation.success) {
      return validation.response!;  // HTTP 400 with field-level errors
    }
    
    // Create event
    const event = await prisma.event.create({ data: validation.data });
    return sendSuccess(event, 'Event created successfully', 201);
  } catch (error: any) {
    if (error.code === 'P2003') {
      return sendError(
        'Referenced organizer not found',
        ERROR_CODES.CONSTRAINT_VIOLATION,
        400
      );
    }
    return sendError('Failed to create event', ERROR_CODES.DATABASE_FAILURE, 500);
  }
}
```

#### Success Response (HTTP 201):
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": 12,
    "title": "Tech Conference 2026",
    "description": "Join industry leaders for insights into emerging technologies.",
    "date": "2026-03-15T10:00:00Z",
    "location": "Silicon Valley Convention Center",
    "capacity": 500,
    "organizerId": 1,
    "registrationCount": 0,
    "createdAt": "2026-01-15T10:30:00Z",
    "updatedAt": "2026-01-15T10:30:00Z"
  },
  "timestamp": "2026-01-15T10:30:00.123Z"
}
```

#### Validation Error Response (HTTP 400):
```json
{
  "success": false,
  "message": "Validation Error",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "errors": [
        {
          "field": "title",
          "message": "Event title must be at least 3 characters long",
          "code": "too_small"
        },
        {
          "field": "date",
          "message": "Event date must be in the future",
          "code": "custom"
        },
        {
          "field": "capacity",
          "message": "Capacity must be at least 1",
          "code": "too_small"
        }
      ]
    }
  },
  "timestamp": "2026-01-15T10:30:00.123Z"
}
```

#### Invalid Organizer Response (HTTP 400):
```json
{
  "success": false,
  "message": "Referenced organizer or related resource not found",
  "error": {
    "code": "CONSTRAINT_VIOLATION",
    "details": {
      "error": "Foreign key constraint failed on the field: `Event_organizerId_fkey`"
    }
  },
  "timestamp": "2026-01-15T10:30:00.123Z"
}
```

---

## Sample cURL Commands

### Create User - Valid Request

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Expected Response**: HTTP 201 with user data

---

### Create User - Validation Errors (Missing & Invalid Fields)

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "J",
    "email": "not-an-email",
    "password": "weak"
  }'
```

**Expected Response**: HTTP 400 with errors:
- `name`: "Name must be at least 2 characters long"
- `email`: "Please provide a valid email address"
- `password`: Multiple errors about uppercase, lowercase, number requirements

---

### Create User - Duplicate Email

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "john@example.com",
    "password": "AnotherPass456"
  }'
```

**Expected Response**: HTTP 409
```json
{
  "success": false,
  "message": "A user with this email already exists",
  "error": { "code": "DUPLICATE_ENTRY" },
  "timestamp": "2026-01-15T10:35:00.123Z"
}
```

---

### Create Event - Valid Request

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Conference 2026",
    "description": "Join industry leaders for insights.",
    "date": "2026-03-15T10:00:00Z",
    "location": "Silicon Valley Convention Center",
    "capacity": 500,
    "organizerId": 1
  }'
```

**Expected Response**: HTTP 201 with event data

---

### Create Event - Future Date Validation

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Past Event",
    "date": "2025-01-01T10:00:00Z",
    "location": "Downtown",
    "capacity": 100,
    "organizerId": 1
  }'
```

**Expected Response**: HTTP 400
```json
{
  "success": false,
  "message": "Validation Error",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "errors": [
        {
          "field": "date",
          "message": "Event date must be in the future",
          "code": "custom"
        }
      ]
    }
  },
  "timestamp": "2026-01-15T10:35:00.123Z"
}
```

---

### Create Event - Invalid Capacity

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tiny Event",
    "date": "2026-03-15T10:00:00Z",
    "location": "Downtown",
    "capacity": 0,
    "organizerId": 1
  }'
```

**Expected Response**: HTTP 400
```json
{
  "success": false,
  "message": "Validation Error",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": {
      "errors": [
        {
          "field": "capacity",
          "message": "Capacity must be at least 1",
          "code": "too_small"
        }
      ]
    }
  },
  "timestamp": "2026-01-15T10:35:00.123Z"
}
```

---

### Create Event - Invalid Organizer

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Orphan Event",
    "date": "2026-03-15T10:00:00Z",
    "location": "Downtown",
    "capacity": 100,
    "organizerId": 99999
  }'
```

**Expected Response**: HTTP 400
```json
{
  "success": false,
  "message": "Referenced organizer or related resource not found",
  "error": {
    "code": "CONSTRAINT_VIOLATION",
    "details": {
      "error": "Foreign key constraint failed on the field: `Event_organizerId_fkey`"
    }
  },
  "timestamp": "2026-01-15T10:35:00.123Z"
}
```

---

### Invalid JSON Request

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d 'this is not json'
```

**Expected Response**: HTTP 400
```json
{
  "success": false,
  "message": "Invalid JSON",
  "error": {
    "code": "INVALID_JSON",
    "details": {
      "message": "Request body must be valid JSON"
    }
  },
  "timestamp": "2026-01-15T10:35:00.123Z"
}
```

---

## Frontend Integration Example

### React Component Using Shared Schema

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, type CreateUserRequest } from '@/lib/schemas/userSchema';

export function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserRequest>({
    resolver: zodResolver(createUserSchema),  // Same schema as backend
  });

  const onSubmit = async (data: CreateUserRequest) => {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Validation errors:', error.error.details.errors);
      return;
    }

    const result = await response.json();
    console.log('User created:', result.data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} placeholder="Name" />
      {errors.name && <span>{errors.name.message}</span>}

      <input {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input {...register('password')} type="password" placeholder="Password" />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Sign Up</button>
    </form>
  );
}
```

---

## Benefits Summary

### Data Integrity
✅ **Guaranteed Valid Data**: Schema validation ensures data conforms to requirements  
✅ **Type Safety**: TypeScript types generated from schemas eliminate type mismatches  
✅ **Constraint Validation**: Complex rules (future dates, capacity limits) validated pre-database  
✅ **Early Error Detection**: Catches issues before database queries

### Developer Experience
✅ **Reusable Schemas**: One schema for client-side forms and server-side APIs  
✅ **Clear Documentation**: Schema definitions serve as inline documentation  
✅ **Composable Validation**: Combine and extend schemas for complex scenarios  
✅ **Improved Error Messages**: Custom, user-friendly messages per field  

### Maintainability
✅ **Single Source of Truth**: Validation rules centralized in schema files  
✅ **Easy Updates**: Change validation rules once, all endpoints benefit  
✅ **Better Testing**: Schemas can be tested independently  
✅ **Consistent Error Format**: Structured, predictable error responses  

### Performance
✅ **Early Validation**: Prevents invalid data from reaching database layer  
✅ **Reduced Database Load**: Catches malformed requests before database queries  
✅ **Predictable Response Times**: Invalid input doesn't cause database latency  
✅ **Query Efficiency**: Only valid data is processed

### Security
✅ **Input Sanitization**: Schemas trim whitespace and normalize data  
✅ **Explicit Requirements**: Only declared fields accepted, no implicit passthrough  
✅ **Constraint Verification**: Complex rules validated server-side  
✅ **Attack Surface Reduction**: Invalid requests caught early, not at database

---

## Next Steps

1. **Add registration endpoint validation**:
   ```typescript
   // src/lib/schemas/registrationSchema.ts
   export const createRegistrationSchema = z.object({
     userId: z.number().positive(),
     eventId: z.number().positive(),
   });
   ```

2. **Update registration API route**:
   ```typescript
   // app/api/registrations/route.ts
   const validation = await validateRequest(req, createRegistrationSchema);
   ```

3. **Add frontend form validation** using `@hookform/resolvers/zod`

4. **Add comprehensive test suite** for schema validation

5. **Document API with OpenAPI/Swagger** using schema types

---

## References

- [Zod Documentation](https://zod.dev)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Event Ease Project README](./README.md)
