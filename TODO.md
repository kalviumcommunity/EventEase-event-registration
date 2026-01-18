# Security Implementation TODO

## 1. Utilities
- [x] Install `isomorphic-dompurify` dependency
- [x] Create `src/lib/security.ts` with `sanitize` and `sanitizeHTML` functions

## 2. API Protection
- [x] Update `/api/events` POST route to sanitize title, description, location
- [x] Update `/api/users` POST/PUT routes to sanitize name, email, etc.
- [x] Update `/api/auth/signup` to sanitize user inputs
- [ ] Update other POST/PUT routes as needed

## 3. UI Protection
- [x] Search components for `dangerouslySetInnerHTML` usage - none found
- [x] Wrap any found instances with `sanitizeHTML` - not needed

## 4. Security Headers
- [x] Add OWASP headers to `next.config.ts`:
  - Content-Security-Policy
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff

## 5. Documentation
- [x] Add "Security Audit" section to README_SECURITY.md with before/after examples
- [x] Explain Prisma's SQL injection protection

## Testing
- [ ] Test sanitization with malicious inputs
- [ ] Verify security headers in browser
- [ ] Ensure no functionality regressions
