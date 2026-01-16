# Comment Cleanup Plan

## Information Gathered
- Searched for single-line comments (//) across TypeScript files.
- Identified files with comments that may need removal based on rules:
  - Remove comments that simply describe code actions (e.g., "// save to database").
  - Preserve JSDoc blocks (/** ... */), long explanations (>2 lines), TODO/FIXME.
- Files to process: src/middleware.ts, src/lib/schemas/eventSchema.ts, src/lib/responseHandler.ts, src/lib/eventRegistration.ts, src/lib/errorCodes.ts, src/lib/auth.ts, prisma/seed.ts, app/api/users/route.ts, app/api/registrations/route.ts, app/api/events/route.ts, app/api/auth/signup/route.ts, app/api/auth/login/route.ts, prisma.config.ts.

## Plan
- Edit each file to remove qualifying comments while preserving code integrity.
- For each file, identify and remove single/double-line action-describing comments.
- Preserve multi-line JSDoc, complex "why" explanations, TODO/FIXME.

## Dependent Files to Edit
- src/middleware.ts
- src/lib/responseHandler.ts
- src/lib/eventRegistration.ts
- src/lib/errorCodes.ts
- src/lib/auth.ts
- prisma/seed.ts
- app/api/users/route.ts
- app/api/registrations/route.ts
- app/api/events/route.ts
- app/api/auth/signup/route.ts
- app/api/auth/login/route.ts
- prisma.config.ts

## Followup Steps
- Verify changes by running tests or checking syntax.
- Ensure no logic, imports, or variable names were altered.
