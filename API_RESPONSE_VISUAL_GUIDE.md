# API Response Standardization - Visual Flow Guide

## Response Handler Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      API Route Handler                          │
│                    (users, events, etc.)                        │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                    ┌──────▼─────────┐
                    │  Try/Catch     │
                    └──────┬─────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
        ┌───────▼────────┐   ┌────────▼────────┐
        │ Validation OK? │   │ Error Thrown?   │
        └───────┬────────┘   └────────┬────────┘
                │                     │
           (YES)│                     │(YES)
                │                     │
        ┌───────▼──────────────┐ ┌────▼───────────────┐
        │ Query Database       │ │ sendError()        │
        └───────┬──────────────┘ └────┬───────────────┘
                │                     │
        ┌───────▼──────────────┐      │
        │ Result Found?        │      │
        └───────┬──────────────┘      │
                │                     │
           ┌────┴────┐                │
       (YES)│         │(NO)           │
           │         │               │
    ┌──────▼──┐  ┌───▼─────────────────────────┐
    │SUCCESS  │  │ sendError(NOT_FOUND, 404)  │
    │         │  └───────┬─────────────────────┘
    └──────┬──┘          │
           │             │
    ┌──────▼────────────┐│
    │ sendSuccess()     ││
    │ (200 or 201)      ││
    └────────┬─────────┘│
             │          │
             └────┬─────┘
                  │
         ┌────────▼──────────────────────────────┐
         │  NextResponse.json(ApiResponse)       │
         │  + Status Code (200, 201, 400, etc)   │
         │  + Timestamp                          │
         │  + Error Code (if error)              │
         └────────┬──────────────────────────────┘
                  │
         ┌────────▼────────────┐
         │  HTTP Response      │
         │  (to Client)        │
         └─────────────────────┘
```

---

## Request-Response Flow

### Success Path (GET User)

```
CLIENT REQUEST
     │
     ▼
GET /api/users?page=1&limit=10
     │
     ├─ Parse searchParams
     ├─ Validate: page ≥ 1, limit ≥ 1 ✓
     │
     ├─ Query: prisma.user.findMany()
     ├─ Result: [user1, user2, ...]
     │
     ├─ sendSuccess(users, message, 200)
     │
     └─ NextResponse.json({
         success: true,
         message: "Users retrieved successfully",
         data: [...],
         timestamp: "2026-01-15T10:30:45.123Z"
       }, { status: 200 })
     │
     ▼
CLIENT RECEIVES ✅
{
  "success": true,
  "message": "Users retrieved successfully",
  "data": [{ id: 1, email: "alice@example.com" }],
  "timestamp": "2026-01-15T10:30:45.123Z"
}
```

### Validation Error Path (Invalid Pagination)

```
CLIENT REQUEST
     │
     ▼
GET /api/users?page=-1&limit=10
     │
     ├─ Parse searchParams
     ├─ Validate: page ≥ 1 ❌
     │
     ├─ sendError(message, INVALID_INPUT, 400)
     │
     └─ NextResponse.json({
         success: false,
         message: "Page and limit must be positive numbers",
         error: {
           code: "INVALID_INPUT"
         },
         timestamp: "2026-01-15T10:30:45.123Z"
       }, { status: 400 })
     │
     ▼
CLIENT RECEIVES ❌
{
  "success": false,
  "message": "Page and limit must be positive numbers",
  "error": { "code": "INVALID_INPUT" },
  "timestamp": "2026-01-15T10:30:45.123Z"
}
HTTP Status: 400 Bad Request
```

### Database Error Path (Not Found)

```
CLIENT REQUEST
     │
     ▼
GET /api/users/999999
     │
     ├─ Parse ID
     ├─ Query: prisma.user.findUnique({ id: 999999 })
     ├─ Result: null (not found)
     │
     ├─ sendError(message, NOT_FOUND, 404)
     │
     └─ NextResponse.json({
         success: false,
         message: "User not found",
         error: {
           code: "NOT_FOUND"
         },
         timestamp: "2026-01-15T10:30:45.123Z"
       }, { status: 404 })
     │
     ▼
CLIENT RECEIVES ❌
{
  "success": false,
  "message": "User not found",
  "error": { "code": "NOT_FOUND" },
  "timestamp": "2026-01-15T10:30:45.123Z"
}
HTTP Status: 404 Not Found
```

### Database Constraint Error (Duplicate)

```
CLIENT REQUEST
     │
     ▼
POST /api/users
Body: { email: "alice@example.com", name: "Alice" }
     │
     ├─ Validate: email && name ✓
     ├─ Query: prisma.user.create({ data })
     ├─ Error: Unique constraint violation (P2002)
     │
     ├─ Catch block detects: error.code === 'P2002'
     ├─ sendError(message, DUPLICATE_ENTRY, 409)
     │
     └─ NextResponse.json({
         success: false,
         message: "A user with this email already exists",
         error: {
           code: "DUPLICATE_ENTRY"
         },
         timestamp: "2026-01-15T10:30:45.123Z"
       }, { status: 409 })
     │
     ▼
CLIENT RECEIVES ❌
{
  "success": false,
  "message": "A user with this email already exists",
  "error": { "code": "DUPLICATE_ENTRY" },
  "timestamp": "2026-01-15T10:30:45.123Z"
}
HTTP Status: 409 Conflict
```

### Server Error Path (Database Down)

```
CLIENT REQUEST
     │
     ▼
GET /api/users
     │
     ├─ Parse params
     ├─ Query: prisma.user.findMany()
     ├─ Error: Connection timeout (database down)
     │
     ├─ Catch block: Generic error
     ├─ console.error('[GET /api/users] Error:', error)
     ├─ sendError(message, DATABASE_FAILURE, 500, { error: error.message })
     │
     └─ NextResponse.json({
         success: false,
         message: "Failed to retrieve users",
         error: {
           code: "DATABASE_FAILURE",
           details: {
             error: "Connection timeout"
           }
         },
         timestamp: "2026-01-15T10:30:45.123Z"
       }, { status: 500 })
     │
     ▼
CLIENT RECEIVES ❌
{
  "success": false,
  "message": "Failed to retrieve users",
  "error": {
    "code": "DATABASE_FAILURE",
    "details": { "error": "Connection timeout" }
  },
  "timestamp": "2026-01-15T10:30:45.123Z"
}
HTTP Status: 500 Internal Server Error
```

---

## Error Code Decision Tree

```
                    Error Occurred?
                          │
                    ┌─────┴─────┐
                    │           │
                   NO           YES
                    │           │
                    │      ┌────▼──────────────┐
                    │      │ What type?        │
                    │      └────┬──────────────┘
                    │           │
                    │    ┌──────┼──────────────────────┬──────────────────┐
                    │    │      │                      │                  │
                    │    │      ▼                      ▼                  ▼
                    │    │   VALIDATION?          NOT FOUND?        DATABASE?
                    │    │      │                     │                  │
                    │    │  ┌───┴────────┐       ┌────┴─────┐      ┌─────┴────────┐
                    │    │  │            │       │          │      │              │
                    │    │  ▼            ▼       ▼          ▼      ▼              ▼
                    │    │ REQUIRED?   INVALID? SPECIFIC? GENERIC? CONSTRAINT? CONNECTION?
                    │    │  (yes)      (yes)    (yes)      (yes)    (yes)        (yes)
                    │    │   │          │        │          │        │            │
            ┌───────┴──┐ │  ▼          ▼        ▼          ▼        ▼            ▼
            │          │ │
       SEND SUCCESS   SEND ERROR:
         (200/201)  ┌──┴────────────────────────────────────────────────────────────┐
            │       │ • MISSING_REQUIRED_FIELD (400)                                │
            │       │ • INVALID_INPUT (400)                                        │
            │       │ • USER_NOT_FOUND, EVENT_NOT_FOUND, etc. (404)               │
            │       │ • NOT_FOUND (404)                                            │
            │       │ • DUPLICATE_ENTRY, CONSTRAINT_VIOLATION (400/409/500)        │
            │       │ • DATABASE_CONNECTION_ERROR (500)                            │
            │       │ • DATABASE_FAILURE (500)                                     │
            │       └────────────────────────────────────────────────────────────┘
            │
     ┌──────▼─────────────────────┐
     │ NextResponse.json()         │
     │ + HTTP Status Code          │
     │ + Timestamp                 │
     │ + Error Code (if error)     │
     └──────┬─────────────────────┘
            │
     ┌──────▼────────────┐
     │  HTTP Response    │
     │  (to Client)      │
     └───────────────────┘
```

---

## File Organization

```
EventEase/
│
├── 📂 src/lib/
│   ├── 📄 responseHandler.ts
│   │   ├── sendSuccess<T>()
│   │   ├── sendError()
│   │   └── ApiResponse<T> interface
│   │
│   └── 📄 errorCodes.ts
│       ├── ERROR_CODES
│       ├── ERROR_CODE_TO_STATUS
│       └── ERROR_CODE_MESSAGES
│
├── 📂 app/api/
│   ├── 📂 users/
│   │   └── 📄 route.ts ✅ Updated
│   │       ├── GET() → sendSuccess/sendError
│   │       └── POST() → sendSuccess/sendError
│   │
│   ├── 📂 events/
│   │   └── 📄 route.ts ✅ Updated
│   │       ├── GET() → sendSuccess/sendError
│   │       └── POST() → sendSuccess/sendError
│   │
│   └── 📂 registrations/
│       └── 📄 route.ts ✅ Updated
│           ├── GET() → sendSuccess/sendError
│           └── POST() → sendSuccess/sendError
│
├── 📄 API_RESPONSE_STANDARDIZATION.md
│   └── Complete implementation guide
│
├── 📄 API_RESPONSE_QUICK_REFERENCE.md
│   └── Quick lookup and patterns
│
├── 📄 API_RESPONSE_INTEGRATION_GUIDE.md
│   └── Frontend integration & testing
│
└── 📄 IMPLEMENTATION_COMPLETE.md
    └── Summary and next steps
```

---

## HTTP Status Code Mapping

```
                    sendError(message, code, status)
                              │
                    ┌─────────┴─────────┐
                    │                   │
                 (Yes)               (No)
                    │                   │
            Use provided            Use lookup
            status param            from ERROR_CODE_TO_STATUS
                    │                   │
                    └─────────┬─────────┘
                              │
                         ┌────▼──────────────────────────────┐
                         │ NextResponse.json(              │
                         │   ApiResponse,                 │
                         │   { status: httpStatus }       │
                         │ )                              │
                         └────┬──────────────────────────────┘
                              │
                    HTTP Response with
                    proper status code
                         │
        ┌────────────────┼────────────────────────┬───────────────────┐
        │                │                        │                   │
        ▼                ▼                        ▼                   ▼
    200 OK           400 Bad Request          404 Not Found      500 Server Error
    (GET success)    (validation)             (not found)        (database error)
    201 Created      401 Unauthorized
    (POST success)   403 Forbidden
                     409 Conflict
                     (duplicate)
```

---

## Integration Points

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Browser / Client                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ Frontend Application (React)                                 │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │ HTTP Interceptor                                        │ │   │
│  │  │ • Parse standardized response envelope                  │ │   │
│  │  │ • Extract data or error                                 │ │   │
│  │  │ • Route to appropriate handler                          │ │   │
│  │  └─────────────┬───────────────────────────────────────────┘ │   │
│  │                │                                              │   │
│  │    ┌───────────┴──────────────┐                               │   │
│  │    │                          │                               │   │
│  │    ▼                          ▼                               │   │
│  │ Error Toast Hook          State Management                   │   │
│  │ • Map error code         • Set loading                       │   │
│  │   to message             • Set data                          │   │
│  │ • Show UI toast          • Set error                         │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP Request/Response
                              │
┌──────────────────────────────┴──────────────────────────────────────┐
│                    Next.js Backend                                   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ API Route Handler (app/api/*/route.ts)                       │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │ 1. Parse Request                                        │ │   │
│  │  │ 2. Validate Input                                       │ │   │
│  │  │ 3. Execute Business Logic (DB query, etc)              │ │   │
│  │  │ 4. Format Response using sendSuccess/sendError         │ │   │
│  │  │ 5. Return NextResponse with envelope + status          │ │   │
│  │  └─────────────┬───────────────────────────────────────────┘ │   │
│  │                │                                              │   │
│  │                ▼                                              │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │ Response Handler Library (src/lib/)                     │ │   │
│  │  │ • responseHandler.ts: sendSuccess/sendError             │ │   │
│  │  │ • errorCodes.ts: ERROR_CODES, mappings                  │ │   │
│  │  └─────────────────────────────────────────────────────────┘ │   │
│  │                │                                              │   │
│  │                ▼                                              │   │
│  │  ┌─────────────────────────────────────────────────────────┐ │   │
│  │  │ Database & External Services                            │ │   │
│  │  │ • Prisma ORM                                            │ │   │
│  │  │ • Error Handling (P2002, P2003, etc)                    │ │   │
│  │  └─────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              │ Logs
                              │
                    ┌─────────▼──────────┐
                    │ Monitoring Service │
                    │ • Error tracking   │
                    │ • Metrics          │
                    │ • Alerts           │
                    └────────────────────┘
```

---

## Usage Pattern Flowchart

```
Create New API Endpoint
     │
     ├─ Import:
     │  • sendSuccess, sendError
     │  • ERROR_CODES
     │  • prisma
     │
     ├─ Wrap in try/catch
     │
     ├─ In try block:
     │  ├─ Parse request (URL params, body)
     │  ├─ Validate input
     │  │  └─ If invalid: sendError(..., ERROR_CODES.INVALID_INPUT, 400)
     │  ├─ Query database (prisma)
     │  ├─ Check result
     │  │  └─ If not found: sendError(..., ERROR_CODES.NOT_FOUND, 404)
     │  └─ Return sendSuccess(data, message, statusCode)
     │
     ├─ In catch block:
     │  ├─ Log error
     │  ├─ Check error type:
     │  │  ├─ If Prisma P2002: DUPLICATE_ENTRY (409)
     │  │  ├─ If Prisma P2003: CONSTRAINT_VIOLATION (400)
     │  │  ├─ Else: DATABASE_FAILURE (500)
     │  └─ Return sendError(..., errorCode, status, details)
     │
     └─ Done! ✅
```

---

## Debugging Flowchart

```
Response Received
     │
     ├─ Check: json.success?
     │
     ├─ YES → Success path
     │  ├─ Extract: json.data
     │  ├─ Check timestamp
     │  └─ Process data
     │
     └─ NO → Error path
        ├─ Extract: json.error.code
        ├─ Extract: json.message
        ├─ Extract: json.timestamp
        ├─ Check: json.error.details?
        │  └─ YES → Additional debugging info
        │
        ├─ Cross-reference error code:
        │  ├─ INVALID_INPUT? → Check input format
        │  ├─ NOT_FOUND? → Check resource exists
        │  ├─ DUPLICATE_ENTRY? → Check unique constraints
        │  ├─ DATABASE_FAILURE? → Check server logs
        │  └─ (other codes)
        │
        └─ Use timestamp to search server logs
```
