# Zod Validation Architecture

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Client Layer                            │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ React Form Component (uses same schema for client validation)│ │
│  │ import { createUserSchema } from '@/lib/schemas/userSchema'  │ │
│  │ // Type-safe form with auto-complete                        │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│                              ↓                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │  Send JSON POST body                                         │ │
│  │  { name, email, password }                                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────
                              │
                              ↓ HTTP POST /api/users
┌─────────────────────────────────────────────────────────────────┐
│                       Route Handler Layer                         │
│  (app/api/users/route.ts)                                         │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ export async function POST(req: Request) {                   │ │
│  │   const validation = await validateRequest(req, schema)     │ │
│  │   if (!validation.success) return validation.response        │ │
│  │   const user = await prisma.user.create()                   │ │
│  │   return sendSuccess(user, 'Created', 201)                  │ │
│  │ }                                                            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│                              ↓                                    │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │         Validation Utility Layer                             │ │
│  │    (src/lib/schemas/validationUtils.ts)                      │ │
│  │  ┌───────────────────────────────────────────────────────┐  │ │
│  │  │ validateRequest(req, schema)                          │  │ │
│  │  │ 1. Parse request.json()                               │  │ │
│  │  │ 2. Call schema.safeParse(data)                        │  │ │
│  │  │ 3. Return { success: bool, data?, response? }         │  │ │
│  │  └───────────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│                    ┌─────────┴─────────┐                          │
│                    ↓                   ↓                          │
│  ┌─────────────────────────────┐   ┌──────────────────────────┐  │
│  │  Schema Layer               │   │  Response Handler Layer  │  │
│  │ (userSchema.ts,             │   │  (responseHandler.ts)    │  │
│  │  eventSchema.ts)            │   │                          │  │
│  │                             │   │  ┌────────────────────┐  │  │
│  │ ┌─────────────────────────┐ │   │  │ sendSuccess()     │  │  │
│  │ │ createUserSchema        │ │   │  │ sendError()       │  │  │
│  │ │ ├─ name validation      │ │   │  │ ApiResponse<T>    │  │  │
│  │ │ ├─ email validation     │ │   │  └────────────────────┘  │  │
│  │ │ ├─ password validation  │ │   │                          │  │
│  │ │ └─ error messages       │ │   └──────────────────────────┘  │
│  │ └─────────────────────────┘ │                                │
│  │                             │                                │
│  │ ┌─────────────────────────┐ │                                │
│  │ │ createEventSchema       │ │                                │
│  │ │ ├─ title validation     │ │                                │
│  │ │ ├─ date validation      │ │                                │
│  │ │ ├─ capacity validation  │ │                                │
│  │ │ ├─ location validation  │ │                                │
│  │ │ ├─ organizerId (FK)     │ │                                │
│  │ │ └─ error messages       │ │                                │
│  │ └─────────────────────────┘ │                                │
│  └─────────────────────────────┘                                │
└─────────────────────────────────────────────────────────────────
                              │
                    ┌─────────┴─────────┐
                    ↓                   ↓
         ✅ Valid Data              ❌ Invalid Data
                    │                   │
                    ↓                   ↓
    ┌──────────────────────────┐   ┌────────────────┐
    │  Database Layer          │   │  HTTP Response │
    │  (Prisma PostgreSQL)     │   │                │
    │  - Create user           │   │  HTTP 400      │
    │  - Update event          │   │  {             │
    │  - Return created resource   │    success: f  │
    │    or database error         │    errors: ..  │
    │                          │   │  }             │
    └──────────────────────────┘   └────────────────┘
                    │
                    ↓
         ┌──────────────────────────┐
         │  Response Envelope       │
         │  {                       │
         │    success: true,        │
         │    data: {...},          │
         │    timestamp: "..."      │
         │  }                       │
         │                          │
         │  HTTP 201 Created        │
         └──────────────────────────┘
                    │
                    ↓ Return to Client
```

---

## Validation Flow Diagram

```
                    ┌─────────────────┐
                    │  HTTP Request   │
                    │  POST /api/users│
                    │  Content-Type:  │
                    │    application/ │
                    │    json         │
                    └────────┬────────┘
                             │
                             ↓
                    ┌─────────────────┐
                    │  Route Handler  │
                    │  exports POST() │
                    └────────┬────────┘
                             │
                             ↓
                    ┌─────────────────┐
                    │  validateReq()  │
                    │  extracted from │
                    │  validationUtils│
                    └────────┬────────┘
                             │
                             ↓
                    ┌─────────────────┐
                    │ await req.json()│
                    │ Parse request   │
                    │ body to object  │
                    └────────┬────────┘
                             │
                             ↓
                    ┌─────────────────┐
              ┌─────┤ schema.safeParse│
              │     │     (data)      │
              │     └─────────────────┘
              │
    ┌─────────┴──────────┐
    │                    │
    ↓ Success           ↓ Failure
┌──────────────┐    ┌─────────────┐
│{success:true,│    │{success:    │
│ data: {      │    │ false,      │
│  name:"John",│    │ error:...}  │
│  email:"..."│    │             │
│  password:..│    │ Extract     │
│}}           │    │ field-level │
└──────┬───────┘    │ errors      │
       │            │             │
       │            └──────┬──────┘
       │                   │
       ↓                   ↓
   Database           HTTP Response
   Operation          HTTP 400
   (Prisma)           {
   Create User          success: false,
   │                    message: "...",
   ├─ P2002             error: {
   │  (Duplicate)       code: "VALIDATION",
   │  → HTTP 409        details: {
   │                      errors: [
   ├─ Other error       {
   │  → HTTP 500         field: "email",
   │                     message: "...",
   │                     code: "..."
   └─ Success           }]
      → HTTP 201        }
         with data    }
```

---

## Schema Hierarchy

```
Zod Schema System
│
├── Base Schemas (Reusable building blocks)
│   │
│   ├── userBaseSchema
│   │   ├─ name: z.string().min(2).max(100).trim()
│   │   ├─ email: z.string().email().toLowerCase().trim()
│   │   └─ password: z.string().min(8).regex(...)
│   │
│   └── eventBaseSchema
│       ├─ title: z.string().min(3).max(200).trim()
│       ├─ description: z.string().max(2000).trim().optional()
│       ├─ date: z.string().datetime().refine(future)
│       ├─ location: z.string().min(2).max(200).trim()
│       └─ capacity: z.number().int().min(1).max(100000)
│
├── Request Schemas (For POST/PUT handlers)
│   │
│   ├── createUserSchema = userBaseSchema
│   │   └─ Used in: POST /api/users
│   │
│   ├── updateUserSchema = userBaseSchema.partial()
│   │   └─ Used in: PUT /api/users/:id
│   │
│   ├── createEventSchema = eventBaseSchema.extend({
│   │                         organizerId: z.number().positive()
│   │                       })
│   │   └─ Used in: POST /api/events
│   │
│   └── updateEventSchema = eventBaseSchema.partial().omit({ date })
│       └─ Used in: PUT /api/events/:id
│
├── Response Schemas (For response validation)
│   │
│   ├── userResponseSchema = userBaseSchema.extend({
│   │                          id, createdAt, updatedAt
│   │                        })
│   │   └─ Used in: Validate outbound user data
│   │
│   └── eventResponseSchema = createEventSchema.extend({
│                               id, createdAt, updatedAt, registrationCount
│                             })
│       └─ Used in: Validate outbound event data
│
└── TypeScript Type Exports
    │
    ├── CreateUserRequest
    ├── UpdateUserRequest
    ├── UserResponse
    ├── CreateEventRequest
    ├── UpdateEventRequest
    └── EventResponse
        └─ All used for frontend type safety
```

---

## Error Response Flow

```
Request arrives with invalid data
        │
        ↓
validateRequest() called
        │
        ↓
schema.safeParse() returns { success: false, error }
        │
        ↓
Extract error details:
  error.errors = [
    { path, message, code },
    { path, message, code },
    ...
  ]
        │
        ↓
Format as structured response:
  {
    success: false,
    message: "Validation Error",
    error: {
      code: "VALIDATION_ERROR",
      details: {
        errors: [
          { field: "email", message: "...", code: "..." },
          { field: "password", message: "...", code: "..." }
        ]
      }
    },
    timestamp: "2026-01-15T..."
  }
        │
        ↓
Return NextResponse.json(errorResponse, { status: 400 })
        │
        ↓
Client receives HTTP 400 with field-level errors
        │
        ↓
Frontend parses error.error.details.errors
        │
        ↓
Display errors to user:
  - Email field: "invalid email format"
  - Password field: "must contain uppercase letter"
```

---

## Integration Points

```
┌─────────────────────────────────────────────────────────┐
│                    EventEase Project                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Frontend Layer                                         │
│  ├─ React components                                   │
│  ├─ @hookform/resolvers/zod (can reuse schemas)       │
│  └─ Same CreateUserRequest type for form data         │
│                                                        │
│  API Route Handlers (Next.js App Router)              │
│  ├─ app/api/users/route.ts                            │
│  │  └─ validateRequest(req, createUserSchema)         │
│  │                                                     │
│  ├─ app/api/events/route.ts                           │
│  │  └─ validateRequest(req, createEventSchema)        │
│  │                                                     │
│  └─ app/api/registrations/route.ts (future)           │
│     └─ validateRequest(req, createRegistrationSchema) │
│                                                        │
│  Validation Layer (NEW)                               │
│  ├─ src/lib/schemas/userSchema.ts                     │
│  ├─ src/lib/schemas/eventSchema.ts                    │
│  ├─ src/lib/schemas/validationUtils.ts               │
│  └─ (Can add registrationSchema.ts)                   │
│                                                        │
│  Response Layer                                        │
│  ├─ src/lib/responseHandler.ts                        │
│  │  ├─ sendSuccess()                                  │
│  │  └─ sendError()                                    │
│  └─ Consistent ApiResponse<T> envelope               │
│                                                        │
│  Data Layer                                            │
│  ├─ prisma/schema.prisma                             │
│  ├─ src/lib/prisma.ts (client)                       │
│  └─ PostgreSQL database                              │
│                                                        │
└─────────────────────────────────────────────────────────┘
```

---

## Error Handling Hierarchy

```
Request Errors
    │
    ├── HTTP 400 - Bad Request (Client Error)
    │   ├── Invalid JSON
    │   │   └─ message: "Invalid JSON"
    │   │   └─ code: "INVALID_JSON"
    │   │
    │   ├── Validation Error (Zod)
    │   │   └─ message: "Validation Error"
    │   │   └─ code: "VALIDATION_ERROR"
    │   │   └─ details: { errors: [...] }
    │   │
    │   └── Constraint Violation (FK not found)
    │       └─ message: "Referenced resource not found"
    │       └─ code: "CONSTRAINT_VIOLATION"
    │
    ├── HTTP 409 - Conflict
    │   └── Duplicate Entry (Unique constraint)
    │       └─ message: "A user with this email already exists"
    │       └─ code: "DUPLICATE_ENTRY"
    │
    └── HTTP 500 - Server Error
        ├── Database Failure
        │   └─ code: "DATABASE_FAILURE"
        │
        └── Internal Server Error
            └─ code: "INTERNAL_ERROR"
```

---

## Data Transformation Pipeline

```
Raw HTTP Request Body
  ↓
  │ JSON Parse
  ↓
JavaScript Object
  ├─ { name: "John", email: "John@Example.Com", password: "pass" }
  ↓
  │ Zod Validation & Transformation
  ├─ Trim whitespace
  ├─ Lowercase email
  ├─ Validate constraints
  ↓
Validated & Normalized Object
  ├─ { name: "John", email: "john@example.com", password: "pass" }
  ↓
  │ Type-Checked (TypeScript)
  ↓
Fully Typed Data
  ├─ CreateUserRequest type
  ↓
  │ Database Operation
  ↓
Database Record Created
  ├─ { id: 1, name: "John", email: "john@example.com", ... }
  ↓
  │ Response Formatting
  ↓
API Response
  {
    success: true,
    message: "User created successfully",
    data: {...},
    timestamp: "..."
  }
```

---

## Files & Dependencies

```
src/lib/schemas/
  ├── userSchema.ts
  │   ├─ Depends on: zod
  │   ├─ Exports: schemas, types, helpers
  │   └─ Used by: app/api/users/route.ts
  │
  ├── eventSchema.ts
  │   ├─ Depends on: zod
  │   ├─ Exports: schemas, types, helpers
  │   └─ Used by: app/api/events/route.ts
  │
  └── validationUtils.ts
      ├─ Depends on: zod, next/server
      ├─ Exports: validateRequest, validateData, formatZodErrors
      └─ Used by: all route handlers

app/api/users/route.ts
  ├─ Depends on: validationUtils, userSchema, prisma, responseHandler
  └─ Exports: GET, POST (PUT, DELETE via [id]/route.ts)

app/api/events/route.ts
  ├─ Depends on: validationUtils, eventSchema, prisma, responseHandler
  └─ Exports: GET, POST (PUT, DELETE via [id]/route.ts)

package.json
  └─ Depends on: zod (v4.3.5)
```

---

**Architecture Last Updated**: January 15, 2026  
**Framework**: Next.js 16 (App Router)  
**Validation Library**: Zod v3  
**Database**: PostgreSQL via Prisma
