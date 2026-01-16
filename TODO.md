# RBAC Implementation TODO

## Completed
- [x] Update auth.ts to include role in JWT payload
- [x] Update login route to sign token with role
- [x] Create src/middleware.ts for authorization
- [x] Remove JWT verification from users/route.ts (middleware handles it)
- [x] Create /api/admin/route.ts for admin-only access

## Remaining
- [ ] Test the implementation with curl examples
- [ ] Create documentation (README-ready)
- [ ] Verify middleware works for /api/users/* and /api/admin/*
- [ ] Ensure no console.logs or unnecessary comments
