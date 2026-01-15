# API Response Standardization - Quick Reference

## Files Created/Updated

### 1. **Response Handler** - `src/lib/responseHandler.ts`
Provides two main functions:

```typescript
// For successful responses
sendSuccess<T>(data: T, message?: string, status?: number): NextResponse<ApiResponse<T>>

// For error responses  
sendError(message?: string, code?: string, status?: number, details?: any): NextResponse<ApiResponse>
```

### 2. **Error Codes** - `src/lib/errorCodes.ts`
Centralized error definitions with:
- `ERROR_CODES` object with all error code constants
- `ERROR_CODE_TO_STATUS` mapping error codes to HTTP status codes
- `ERROR_CODE_MESSAGES` mapping error codes to user-friendly messages

### 3. **Updated API Routes**
All three routes now follow the standardized pattern:
- `app/api/users/route.ts` ✅
- `app/api/events/route.ts` ✅
- `app/api/registrations/route.ts` ✅

---

## Quick Pattern Template

Use this template for any new API endpoint:

```typescript
import prisma from '@/lib/prisma';
import { sendSuccess, sendError } from '@/lib/responseHandler';
import { ERROR_CODES } from '@/lib/errorCodes';

export async function GET(req: Request) {
  try {
    // 1. Parse request
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    // 2. Validate input
    if (!id) {
      return sendError(
        'ID is required',
        ERROR_CODES.MISSING_REQUIRED_FIELD,
        400
      );
    }

    // 3. Execute database operation
    const data = await prisma.model.findUnique({ where: { id: Number(id) } });

    // 4. Handle not found
    if (!data) {
      return sendError(
        'Resource not found',
        ERROR_CODES.NOT_FOUND,
        404
      );
    }

    // 5. Return success
    return sendSuccess(data, 'Resource retrieved successfully');
  } catch (error: any) {
    console.error('[GET /api/resource] Error:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return sendError('Duplicate entry', ERROR_CODES.DUPLICATE_ENTRY, 409);
    }
    
    // Generic error fallback
    return sendError(
      'Operation failed',
      ERROR_CODES.DATABASE_FAILURE,
      500,
      { error: error.message }
    );
  }
}
```

---

## Response Examples at a Glance

### ✅ Success Response (200 OK)
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [ /* ... */ ],
  "timestamp": "2026-01-15T10:30:45.123Z"
}
```

### ❌ Validation Error (400 Bad Request)
```json
{
  "success": false,
  "message": "Title is required",
  "error": { "code": "MISSING_REQUIRED_FIELD" },
  "timestamp": "2026-01-15T10:30:45.123Z"
}
```

### ❌ Duplicate Entry (409 Conflict)
```json
{
  "success": false,
  "message": "User already exists",
  "error": { "code": "DUPLICATE_ENTRY" },
  "timestamp": "2026-01-15T10:30:45.123Z"
}
```

### ❌ Server Error (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Failed to retrieve users",
  "error": {
    "code": "DATABASE_FAILURE",
    "details": { "error": "Connection timeout" }
  },
  "timestamp": "2026-01-15T10:30:45.123Z"
}
```

---

## Common Error Codes & When to Use

| Scenario | Error Code | HTTP Status |
|----------|-----------|-------------|
| User forgot to send email in POST body | `MISSING_REQUIRED_FIELD` | 400 |
| Page number is negative | `INVALID_INPUT` | 400 |
| User tries to delete event that doesn't exist | `NOT_FOUND` | 404 |
| User tries to create duplicate email | `DUPLICATE_ENTRY` | 409 |
| Database connection drops | `DATABASE_FAILURE` | 500 |
| Event references non-existent organizer | `CONSTRAINT_VIOLATION` | 400 |

---

## Frontend Usage Example

```typescript
// React Hook
const [users, setUsers] = useState([]);
const [error, setError] = useState(null);

const fetchUsers = async () => {
  try {
    const res = await fetch('/api/users?page=1&limit=10');
    const json = await res.json();

    if (json.success) {
      setUsers(json.data);
      setError(null);
    } else {
      // Handle specific error codes
      if (json.error.code === 'DATABASE_FAILURE') {
        setError('Database is currently unavailable. Please try again later.');
      } else {
        setError(json.message);
      }
    }
  } catch (err) {
    setError('Network error');
  }
};
```

---

## HTTP Status Code Summary

| Status | Meaning | Use When |
|--------|---------|----------|
| 200 | OK | Successful GET/PUT/PATCH |
| 201 | Created | Successful POST creating a resource |
| 400 | Bad Request | Validation error, invalid input |
| 401 | Unauthorized | User not authenticated |
| 403 | Forbidden | User authenticated but lacks permission |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource or constraint violation |
| 500 | Server Error | Unhandled exception, database error |

---

## Checklist for New Endpoints

When creating a new API route, ensure:

- [ ] Import `sendSuccess`, `sendError` from `@/lib/responseHandler`
- [ ] Import `ERROR_CODES` from `@/lib/errorCodes`
- [ ] Wrap handler logic in try/catch
- [ ] Use `sendSuccess()` for successful responses
- [ ] Use `sendError()` for all error responses
- [ ] Add inline comments explaining the handler's purpose
- [ ] Return appropriate HTTP status codes (200, 201, 400, 404, 409, 500)
- [ ] Include validation before database operations
- [ ] Log errors to console with endpoint context
- [ ] Handle Prisma-specific error codes (P2002, P2003, etc.)
- [ ] Test both success and error paths

---

## Documentation Files

- **Full Guide:** [API_RESPONSE_STANDARDIZATION.md](../API_RESPONSE_STANDARDIZATION.md)
- **Response Handler:** [src/lib/responseHandler.ts](../src/lib/responseHandler.ts)
- **Error Codes:** [src/lib/errorCodes.ts](../src/lib/errorCodes.ts)
- **Example Routes:**
  - [app/api/users/route.ts](../app/api/users/route.ts)
  - [app/api/events/route.ts](../app/api/events/route.ts)
  - [app/api/registrations/route.ts](../app/api/registrations/route.ts)
