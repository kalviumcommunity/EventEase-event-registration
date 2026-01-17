# EventEase – Full-Stack Event Registration System

EventEase is a full-stack web application designed to simplify event creation, discovery, and registration.  
It provides a secure and user-friendly platform suitable for students, communities, and small organizations to manage events efficiently.

This repository represents the foundation of the EventEase project, built using Next.js with TypeScript and structured to support scalable, secure, and maintainable full-stack development.

---

## Problem Statement

Manual event registration processes are inefficient and prone to errors such as:
- Duplicate registrations
- Poor data management
- Lack of centralized access
- Limited visibility into event participation

A simple, secure, and reliable digital solution is required to manage events and registrations effectively.

---

## API Documentation

## API Route Hierarchy
- **/api/users**
  - `GET` - List users
  - `POST` - Create a new user
  - `PUT` - Update a user
  - `DELETE` - Delete a user

- **/api/events**
  - `GET` - List events
  - `POST` - Create a new event
  - `PUT` - Update an event
  - `DELETE` - Delete an event

- **/api/registrations**
  - `GET` - List registrations
  - `POST` - Create a new registration
  - `PUT` - Update a registration
  - `DELETE` - Delete a registration

## Supported HTTP Methods
- **GET**: Retrieve a list of resources with pagination and filtering options.
- **POST**: Create a new resource.
- **PUT**: Update an existing resource.
- **DELETE**: Remove a resource.

## Sample CURL Commands

### List Users
```bash
curl -X GET 'http://localhost:3000/api/users?page=1&limit=10'
```

### Create User
```bash
curl -X POST 'http://localhost:3000/api/users' -H 'Content-Type: application/json' -d '{"name": "John Doe", "email": "john@example.com"}'
```

### List Events
```bash
curl -X GET 'http://localhost:3000/api/events?page=1&limit=10&organizerId=1'
```

### Create Event
```bash
curl -X POST 'http://localhost:3000/api/events' -H 'Content-Type: application/json' -d '{"title": "Event Title", "date": "2026-01-15"}'
```

### List Registrations
```bash
curl -X GET 'http://localhost:3000/api/registrations?page=1&limit=10&userId=1'
```

### Create Registration
```bash
curl -X POST 'http://localhost:3000/api/registrations' -H 'Content-Type: application/json' -d '{"eventId": 1, "userId": 1}'
```

## Example Success and Error Responses
- **Success Response**: 
  ```json
  {
      "id": 1,
      "name": "John Doe"
  }
  ```
- **Error Response**: 
  ```json
  {
      "error": "User not found"
  }
  ```

## Pagination Explanation
- Use `page` and `limit` query parameters to control the number of results returned.
- Default values are `page=1` and `limit=10`.

## Reflection on RESTful Structure
Implementing a RESTful API structure improves maintainability and team collaboration by providing a clear and consistent way to interact with resources. It allows for easier understanding of the API's capabilities and promotes best practices in API design.

- Provide secure user authentication  
- Enable users to create and browse events  
- Allow seamless event registration  
- Prevent duplicate registrations for the same event  
- Offer a personalized user dashboard  
- Deliver a functional and production-ready MVP within 4 weeks  

---

## System Overview

EventEase follows a modern full-stack architecture:

- Frontend  
  Handles UI rendering, routing, and client-side validation using the Next.js App Router.

- Backend  
  Manages authentication, event data, and registrations through secure APIs and database operations.

This separation of concerns ensures scalability, maintainability, and clean evolution of the system across future sprints.

---

## Project Structure

src/
├── app/          Application routes and pages (Next.js App Router)  
├── components/   Reusable UI components  
├── lib/          Utilities, helpers, and configuration logic  

---

## Naming Conventions

- Components use PascalCase (e.g., EventCard.tsx)
- Utility files use camelCase (e.g., formatDate.ts)
- Folder names are lowercase and descriptive

---

## Responsive Design & Theming

EventEase implements a responsive layout with dark/light theme toggle using Tailwind CSS and next-themes.

### Breakpoints

| Breakpoint | Value | Description |
|------------|-------|-------------|
| sm | 640px | Small devices (phones) |
| md | 768px | Medium devices (tablets) |
| lg | 1024px | Large devices (desktops) |
| xl | 1280px | Extra large devices (large desktops) |

### Brand Color Palette

| Color | Hex Code | Usage |
|-------|----------|-------|
| Brand Light | #93C5FD | Light accent color |
| Brand Default | #3B82F6 | Primary brand color |
| Brand Dark | #1E40AF | Dark accent color |

### WCAG Accessibility Standards

EventEase adheres to WCAG 2.1 AA standards for color contrast in dark mode. All text and interactive elements maintain a minimum contrast ratio of 4.5:1 against their backgrounds to ensure readability for users with visual impairments.

## Code Quality and Tooling

To maintain a clean, consistent, and high-quality codebase from Day 1, EventEase uses industry-standard tooling.

### TypeScript
- Strict TypeScript configuration is enabled
- Helps catch type and logic errors early
- Improves reliability as the project scales

### ESLint
- Configured using ESLint v9 Flat Config
- Integrated with TypeScript and React
- Customized for Next.js App Router and the automatic JSX runtime
- Node.js globals are explicitly declared for server-side code
- Generated framework files are excluded from linting

### Prettier
- Enforces consistent code formatting across the entire codebase
- Eliminates formatting differences between contributors

### Pre-commit Hooks
- Husky and lint-staged run linting and formatting before every commit
- Prevents poorly formatted or error-prone code from entering the repository

---

## Security & Environment Variables

EventEase implements enterprise-grade security practices for environment variable management to protect sensitive data and prevent accidental exposure of secrets.

### Environment Files

- **`.env.local`** - Stores real secrets and configuration. **Never committed to version control.**
- **`.env.example`** - Documents all required variables with placeholder values. **Committed to repository.**
- **`.env.production.local`** - Production-specific overrides (if needed). **Never committed.**

### Server-Only Variables (Private)

These variables are only accessible on the server-side and are never exposed to the client bundle:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/eventease` |
| `JWT_SECRET` | Secret key for JWT token signing | `your-super-secret-jwt-key-here` |
| `RESEND_API_KEY` | API key for Resend email service | `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `AZURE_STORAGE_ACCOUNT` | Azure Storage account name | `your-storage-account-name` |
| `AZURE_STORAGE_ACCESS_KEY` | Azure Storage access key | `your-storage-access-key-here` |
| `AZURITE_CONNECTION_STRING` | Local Azurite connection (dev only) | `UseDevelopmentStorage=true` |
| `AZURE_STORAGE_CONTAINER_NAME` | Azure blob container name | `uploads` |

### NEXT_PUBLIC Variables (Client-Accessible)

These variables are inlined into the JavaScript bundle and accessible in the browser:

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_URL` | Public application URL | `http://localhost:3000` |

### Build-Time vs Runtime Behavior

**Critical Security Concept**: Next.js processes environment variables differently based on when they're accessed:

- **Build Time**: Variables are evaluated when the application is built (`npm run build`)
- **Runtime**: Server-side code can access all variables; client-side code can only access `NEXT_PUBLIC_*` variables
- **Client Bundle**: Only `NEXT_PUBLIC_*` variables are embedded in the JavaScript sent to browsers

**Security Implication**: Never prefix sensitive data with `NEXT_PUBLIC_` - it becomes public!

### Validation & Error Handling

EventEase uses Zod-powered validation in `src/lib/env.ts` to ensure:

- Required variables are present at startup
- Variables match expected formats (URLs, minimum lengths, API key patterns)
- Clear error messages for missing or invalid configuration
- TypeScript type safety across the application

### Security Audit Results

✅ **No exposed secrets**: Scanned all `src/` files - no sensitive variables prefixed with `NEXT_PUBLIC_`  
✅ **Server-only access**: `JWT_SECRET` and `RESEND_API_KEY` only accessed in Server Components and API routes  
✅ **Git security**: `.gitignore` properly excludes `.env*`, `.env.local`, and `.env*.local`  

### Usage Example

```typescript
// src/lib/env.ts - Validated environment variables
import { env } from '@/lib/env';

// Server-side usage (API routes, Server Components)
const db = new PrismaClient({ datasourceUrl: env.DATABASE_URL });
const token = jwt.sign(payload, env.JWT_SECRET);

// Client-side usage (components) - only NEXT_PUBLIC variables
const appUrl = env.NEXT_PUBLIC_APP_URL; // Safe for browser
```

### Best Practices Implemented

- 🔒 **Centralized validation**: All environment variables validated at application startup
- 🚫 **No hardcoded secrets**: All sensitive values loaded from environment
- 🛡️ **Type safety**: Full TypeScript support prevents runtime errors
- 📝 **Documentation**: `.env.example` provides clear setup instructions
- 🔍 **Audit trail**: Validation catches configuration issues early
- 🚦 **Fail fast**: Application won't start with invalid environment configuration

---

### Branching Strategy and Code Review Process

EventEase follows a structured Git workflow to ensure code quality, collaboration, and long-term maintainability.

Branching Strategy

The project uses a clear and consistent branch naming convention:

feature/<feature-name> for new features

fix/<bug-name> for bug fixes

chore/<task-name> for maintenance tasks

docs/<update-name> for documentation updates

The main branch always represents stable, production-ready code.
All changes are introduced through pull requests.


```

For Next.js App Router compatibility, React is declared as a global in ESLint configuration to support the automatic JSX runtime introduced in modern React versions.


| Relationship         | Type                            |
| -------------------- | ------------------------------- |
| User → Event         | One-to-Many                     |
| User → Registration  | One-to-Many                     |
| Event → Registration | One-to-Many                     |
| User ↔ Event         | Many-to-Many (via Registration) |

## Prisma Integration

This project uses Prisma (v7) as the ORM for PostgreSQL. The repository is configured to
read the database connection from the `DATABASE_URL` environment variable (set in `.env.local`) and
generate a typed Prisma Client using `npx prisma generate`.

- **Singleton client:** A single, reusable Prisma Client instance is exported from `src/lib/prisma.ts`.
  This avoids creating multiple clients during Next.js dev hot-reloads which can exhaust DB connections.
- **Server test route:** A simple server-side API is available at `/api/prisma-test` (file: `src/app/api/prisma-test/route.ts`) that
  runs a safe `findMany()` on the `Event` model, logs the result on the server, and returns JSON for quick verification.
- **Type safety:** Prisma generates fully typed models in `@prisma/client`, enabling TypeScript inference for queries and model shapes.

## Completed Prisma Integration (Jan 8, 2026)

✅ **Singleton client:** Implemented and exported from `src/lib/prisma.ts` (hot-reload safe).  
✅ **Server test route:** Implemented at `src/app/api/prisma-test/route.ts` for quick DB verification.  
✅ **Migrations & schema:** Initial schema applied; migrations tracked in `prisma/migrations/`.  
✅ **Idempotent TypeScript seed:** `prisma/seed.ts` created; runtime fix applied.  
✅ **Fallback SQL seed:** `prisma/seed-pg.js` verified working; populated demo data successfully.  
✅ **Dark-themed landing page:** EventEase home page created with event registration CTA and brand styling.

### Runtime Issue Resolution

Prisma v7 was initially generated with a remote/client engine, causing:
```
PrismaClientConstructorValidationError: Using engine type "client" requires either "adapter" or "accelerateUrl"...
```

**Fix applied (Option 1):**
- Cleaned generated Prisma runtime artifacts
- Regenerated client with `PRISMA_CLIENT_ENGINE_TYPE=binary` to force binary engine mode
- TypeScript seed (`npx tsx prisma/seed.ts`) now works without adapter/accelerateUrl
- Binary engine uses native query compilation and connects via DATABASE_URL

**Fallback available:** `prisma/seed-pg.js` (plain SQL with `pg` package) can seed the DB if needed.

Quick commands

1. Ensure `.env.local` contains a valid `DATABASE_URL`, for example:

```
DATABASE_URL="postgres://postgres:password@localhost:5432/eventdb"
```

2. Generate the Prisma Client:

```bash
npx prisma generate
```

3. Run the app and test the route:

```bash
npm run dev
# then visit http://localhost:3000/api/prisma-test or use curl
```

If the DB is reachable you'll see a server console log like `Prisma test: fetched events count = N` and a JSON response showing the count.

## Database Migrations & Seeding

This project uses Prisma (v7) to manage database schema migrations and seeding.

Migration workflow (initial)

- Create the initial migration locally (runs SQL against your dev database and
  writes migration files to `prisma/migrations/`):

```bash
npx prisma migrate dev --name init_schema
```

- This command will:
  - Compare your `schema.prisma` to the database and generate SQL to bring the
    database schema in sync.
  - Create a timestamped folder under `prisma/migrations/` containing the SQL.
  - Update Prisma's migration history so future migrations are tracked.

Making future schema changes

- When you change the Prisma schema, create a new migration with a meaningful
  name (for example `add_registration_indexes`):

```bash
npx prisma migrate dev --name add_registration_indexes
```

- Prisma records each migration in the `prisma/migrations/` directory and in
  the database migration table so it can track what has been applied.

Resetting or rolling back (local/dev only)

- To reset your local development database and re-apply all migrations and the
  seed script, use:

```bash
npx prisma migrate reset
```

- `migrate reset` drops and recreates the database schema and then runs the
  migrations from scratch. Use this only on local/dev databases — NEVER run
  this against production as it will erase data.

Seeding the database

- The project includes an idempotent TypeScript seed script at `prisma/seed.ts`.
  It uses `upsert` and existence checks so it is safe to run multiple times
  without creating duplicates.

- To run the seed manually:

```bash
npm run prisma:seed
```

- Prisma is configured in `package.json` to run the seed via `ts-node` when
  invoking `prisma db seed` or when running the configured seed script.

Verifying seeded data

- Prisma Studio (visual):
  - Run `npx prisma studio` and inspect `User`, `Event`, and `Registration`.
- Programmatic check (example):
  - Use the test API `GET /api/prisma-test` which runs a small `findMany()`
    against `Event` and returns a JSON count — you should see the demo data.
- Successful output:
  - Seed script prints `✓ Seeding completed successfully!` and lists the
    inserted/ensured records.

Notes & best practices

- Why migrations are versioned: migration files are timestamped and stored so
  teams can review schema changes, roll forward safely, and apply them in CI
  or production in a controlled manner.
- How seed data helps: seeds provide reproducible test data for dev and CI,
  making it easier to develop features and write tests against predictable
  datasets.
- Protecting production data: avoid `migrate reset` in production; instead use
  controlled `prisma migrate deploy` flows and database backups + staging
  environments for testing destructive changes.

---

## Fallback UIs, Loading Skeletons, and Error Boundaries

EventEase implements modern React patterns to enhance user experience during loading states and error scenarios.

### Streaming with Loading Skeletons

Next.js App Router supports **Streaming**, which allows parts of a page to render immediately while slower components load asynchronously. This provides a better user experience by showing content progressively rather than waiting for the entire page to load.

**Benefits of Streaming:**
- **Faster perceived performance**: Users see content sooner, even if some sections are still loading
- **Improved SEO**: Search engines can index content as it streams in
- **Better user engagement**: Reduces bounce rates by providing immediate visual feedback
- **Scalability**: Heavy computations or API calls don't block the entire page render

**Implementation in EventEase:**
- `src/app/events/loading.tsx` provides a skeleton UI that mimics the actual event list layout
- Uses Tailwind's `animate-pulse` for smooth loading animations
- Includes `aria-busy="true"` for accessibility, informing screen readers that content is loading
- Neutral colors (`bg-gray-200`) ensure compatibility with both light and dark themes

### Error Boundaries

Error Boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of crashing the entire application.

**How Error Boundaries Prevent Crashes:**
- **Isolated failures**: When an error occurs in one route (e.g., `/events`), only that route shows an error UI
- **Application stability**: The rest of the app (navigation, other pages) continues to function normally
- **Graceful degradation**: Users see a friendly error message instead of a blank page or browser error
- **Debugging support**: Errors are logged to the console for developers to investigate

**Implementation in EventEase:**
- `src/app/events/error.tsx` is a Client Component that catches errors in the events route
- Accepts `error: Error & { digest?: string }` and `reset: () => void` props as required by Next.js
- Displays a clear error message with a "Try Again" button that calls `reset()` to retry the failed operation
- Logs errors to the console for debugging purposes
- Maintains consistent styling with the EventEase theme

**Usage Example:**
```typescript
// src/app/events/error.tsx
'use client';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  console.error('Events page error:', error);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
        <p className="text-gray-600 mb-6">We encountered an error while loading the events.</p>
        <button
          onClick={reset}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
```

These patterns ensure EventEase provides a robust, user-friendly experience even when things go wrong, maintaining trust and usability across all scenarios.



