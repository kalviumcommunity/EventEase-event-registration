# API Response Standardization Guide

## Overview

EventEase now uses a **centralized response handler** that standardizes all API responses into a consistent envelope format. This ensures predictable response structures across all endpoints, improving developer experience, debugging, and team consistency.

## Response Format

### Success Response

```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe"
    }
  ],
  "timestamp": "2026-01-15T10:30:45.123Z"
}
```

**Fields:**
- `success` (boolean): Always `true` for successful operations
- `message` (string): User-friendly success message
- `data` (any): The actual payload (array, object, or primitive)
- `timestamp` (ISO string): Server time of the response (useful for debugging and observability)

**HTTP Status Codes:**
- `200`: Successful GET, PUT operations
- `201`: Successful POST (resource created)

---

### Error Response

```json
{
  "success": false,
  "message": "User not found",
  "error": {
    "code": "USER_NOT_FOUND",
    "details": {
      "userId": 999,
      "error": "Record to update not found"
    }
  },
  "timestamp": "2026-01-15T10:30:45.123Z"
}
```

**Fields:**
- `success` (boolean): Always `false` for errors
- `message` (string): User-friendly error message
- `error` (object): Error details with:
  - `code` (string): Machine-readable error code (e.g., `USER_NOT_FOUND`, `DATABASE_FAILURE`)
  - `details` (optional): Additional debugging information
- `timestamp` (ISO string): Server time of the response

**HTTP Status Codes:**
- `400`: Bad request (validation error, invalid input)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found (resource doesn't exist)
- `409`: Conflict (duplicate resource)
- `500`: Internal server error (database failure, unhandled exception)

---

## Error Codes

All error codes are centrally defined in `src/lib/errorCodes.ts`:

| Error Code | HTTP Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Generic validation failure |
| `INVALID_INPUT` | 400 | Invalid input provided |
| `MISSING_REQUIRED_FIELD` | 400 | Required field is missing |
| `NOT_FOUND` | 404 | Generic resource not found |
| `USER_NOT_FOUND` | 404 | User does not exist |
| `EVENT_NOT_FOUND` | 404 | Event does not exist |
| `REGISTRATION_NOT_FOUND` | 404 | Registration does not exist |
| `DUPLICATE_ENTRY` | 409 | Resource already exists |
| `DATABASE_FAILURE` | 500 | Database operation failed |
| `DATABASE_CONNECTION_ERROR` | 500 | Cannot connect to database |
| `CONSTRAINT_VIOLATION` | 500 | Data constraint violation (foreign key, etc.) |
| `INTERNAL_ERROR` | 500 | Unhandled internal error |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |

---

## Usage Examples

### Example 1: Successful GET Request

**Endpoint:** `GET /api/users?page=1&limit=10`

**Request:**
```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10" \
  -H "Content-Type: application/json"
```

**Implementation:**
```typescript
import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/responseHandler';
import { ERROR_CODES } from '@/lib/errorCodes';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 10;

    // Validate input
    if (page < 1 || limit < 1) {
      return sendError(
        'Page and limit must be positive numbers',
        ERROR_CODES.INVALID_INPUT,
        400
      );
    }

    const users = await prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
    });

    // sendSuccess returns 200 by default
    return sendSuccess(users, 'Users retrieved successfully');
  } catch (error) {
    console.error('[GET /api/users] Error:', error);
    return sendError(
      'Failed to retrieve users',
      ERROR_CODES.DATABASE_FAILURE,
      500,
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [
    { "id": 1, "email": "alice@example.com", "name": "Alice" },
    { "id": 2, "email": "bob@example.com", "name": "Bob" }
  ],
  "timestamp": "2026-01-15T10:30:45.123Z"
}
```

---

### Example 2: POST with Error Handling

**Endpoint:** `POST /api/events`

**Request:**
```bash
curl -X POST "http://localhost:3000/api/events" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Tech Conference 2026",
    "description": "Annual technology conference",
    "organizerId": 1
  }'
```

**Implementation:**
```typescript
import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/responseHandler';
import { ERROR_CODES } from '@/lib/errorCodes';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Validation: check required fields
    if (!data.title || !data.organizerId) {
      return sendError(
        'Title and organizerId are required',
        ERROR_CODES.MISSING_REQUIRED_FIELD,
        400
      );
    }

    const event = await prisma.event.create({ data });

    // sendSuccess with 201 indicates resource creation
    return sendSuccess(event, 'Event created successfully', 201);
  } catch (error: any) {
    console.error('[POST /api/events] Error:', error);

    // Handle duplicate entry (Prisma P2002)
    if (error.code === 'P2002') {
      return sendError(
        'An event with this title already exists',
        ERROR_CODES.DUPLICATE_ENTRY,
        409
      );
    }

    // Handle foreign key constraint (Prisma P2003)
    if (error.code === 'P2003') {
      return sendError(
        'Referenced organizer not found',
        ERROR_CODES.CONSTRAINT_VIOLATION,
        400,
        { error: error.message }
      );
    }

    // Generic database error
    return sendError(
      'Failed to create event',
      ERROR_CODES.DATABASE_FAILURE,
      500,
      { error: error.message }
    );
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "id": 42,
    "title": "Tech Conference 2026",
    "description": "Annual technology conference",
    "organizerId": 1,
    "createdAt": "2026-01-15T10:30:45.123Z",
    "updatedAt": "2026-01-15T10:30:45.123Z"
  },
  "timestamp": "2026-01-15T10:30:45.123Z"
}
```

**Error Response (409 Conflict - duplicate title):**
```json
{
  "success": false,
  "message": "An event with this title already exists",
  "error": {
    "code": "DUPLICATE_ENTRY"
  },
  "timestamp": "2026-01-15T10:30:45.123Z"
}
```

**Error Response (400 Bad Request - missing required field):**
```json
{
  "success": false,
  "message": "Title and organizerId are required",
  "error": {
    "code": "MISSING_REQUIRED_FIELD"
  },
  "timestamp": "2026-01-15T10:30:45.123Z"
}
```

---

## Benefits of This Pattern

### 1. **Developer Experience**
- Predictable response format across all endpoints
- No need to check multiple response structures
- Faster onboarding for new team members
- Less trial-and-error integration

**Before:**
```typescript
// Inconsistent: sometimes direct array, sometimes wrapped object
const response1 = await fetch('/api/users');
const data1 = await response1.json(); // Could be array or object

const response2 = await fetch('/api/events');
const data2 = await response2.json(); // Different structure entirely
```

**After:**
```typescript
// Consistent: always same envelope structure
const response = await fetch('/api/users');
const json = await response.json();
if (json.success) {
  const users = json.data; // Always here
} else {
  const code = json.error.code; // Always here for errors
}
```

### 2. **Debugging**
- Every response includes a timestamp for request tracing
- Structured error codes instead of ambiguous text
- Optional `details` field for logging additional context
- Server-side console logs correlate with response timestamps

**Example debugging workflow:**
```
Client Log: "Failed at 2026-01-15T10:30:45.123Z"
   ↓
Search server logs for timestamp
   ↓
Find matching error code: DATABASE_FAILURE
   ↓
Check database connection logs at that time
```

### 3. **Observability & Monitoring**
- Error codes enable precise alerting rules
- Frontend can log and send metrics based on error type
- Analytics can track specific failure modes
- Product teams identify high-failure operations

**Example monitoring:**
```typescript
// Alert if 5+ DUPLICATE_ENTRY errors in 1 minute
// Alert if DATABASE_FAILURE rate > 0.1% in 5 minutes
// Track success rate by endpoint and error code
```

### 4. **Team Consistency**
- Single source of truth for response format
- All team members follow the same pattern
- Code reviews focus on business logic, not response structure
- API contracts are clear and documented

**Before:**
```typescript
// Developer A
return NextResponse.json(data);

// Developer B
return NextResponse.json({ message: 'Success', data });

// Developer C
return NextResponse.json({ result: data, error: null });
```

**After:**
```typescript
// Everyone uses this consistently
return sendSuccess(data, 'Operation successful');
```

### 5. **Frontend Integration**
- Single HTTP client interceptor handles all responses
- Type-safe response handling in TypeScript
- Easy to implement global error toasts
- Consistent retry logic for specific error codes

**Example frontend integration:**
```typescript
// Global response interceptor
axios.interceptors.response.use(
  (response) => {
    if (response.data.success) return response.data.data;
    throw new Error(response.data.error.code);
  },
  (error) => {
    const code = error.response?.data?.error?.code;
    
    if (code === 'DUPLICATE_ENTRY') {
      showToast('This resource already exists');
    } else if (code === 'USER_NOT_FOUND') {
      redirectTo('/404');
    } else {
      showToast('An error occurred');
    }
    
    return Promise.reject(error);
  }
);
```

---

## Implementation Checklist

- [x] Created `src/lib/responseHandler.ts` with `sendSuccess` and `sendError` functions
- [x] Created `src/lib/errorCodes.ts` with centralized error code definitions
- [x] Updated `app/api/users/route.ts` to use response handler with try/catch
- [x] Updated `app/api/events/route.ts` to use response handler with try/catch
- [ ] Update `app/api/registrations/route.ts` (following the same pattern)
- [ ] Create dynamic route handlers: `app/api/users/[id]/route.ts`, `app/api/events/[id]/route.ts`, etc.
- [ ] Add frontend interceptors to consume standardized responses
- [ ] Document error scenarios in API specification (OpenAPI/Swagger)
- [ ] Add monitoring/alerting for specific error codes
- [ ] Implement request logging with correlation IDs for tracing

---

## Next Steps

1. **Apply to registrations API:** Update `app/api/registrations/route.ts` using the same pattern
2. **Create dynamic routes:** Add `[id]/route.ts` files for PUT/DELETE operations
3. **Frontend integration:** Add HTTP interceptors to handle consistent response format
4. **Monitoring:** Set up dashboards tracking error codes and success rates
5. **Documentation:** Add this pattern to your API documentation / Swagger spec

---

## Files Reference

- **Response Handler:** [src/lib/responseHandler.ts](src/lib/responseHandler.ts)
- **Error Codes:** [src/lib/errorCodes.ts](src/lib/errorCodes.ts)
- **Updated Routes:**
  - [app/api/users/route.ts](app/api/users/route.ts)
  - [app/api/events/route.ts](app/api/events/route.ts)
