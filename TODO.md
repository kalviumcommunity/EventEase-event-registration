- [ ] Change to check access token from cookies instead of headers
- [ ] If access token missing/expired, internally call `/api/auth/refresh`
- [ ] If refresh fails, redirect to `/login`

## 5. Update `app/api/auth/login/route.ts`
- [ ] Generate access and refresh tokens
- [ ] Set cookies instead of returning token in response

## 6. Update `README.md`
- [ ] Add security documentation section explaining XSS protection, HTTP-only cookies, and token rotation

## Followup Steps
- [ ] Ensure `JWT_REFRESH_SECRET` is added to environment variables
- [ ] Test login, protected routes, and automatic refresh flow
- [ ] Verify cookies are set correctly (HTTP-only, Secure, SameSite)
=======
## 4. Update `src/middleware.ts`
- [x] Change to check access token from cookies instead of headers
- [x] If access token missing/expired, internally call `/api/auth/refresh`
- [x] If refresh fails, redirect to `/login`

## 5. Update `app/api/auth/login/route.ts`
- [x] Generate access and refresh tokens
- [x] Set cookies instead of returning token in response

## 6. Update `README.md`
- [x] Add security documentation section explaining XSS protection, HTTP-only cookies, and token rotation

## Followup Steps
- [x] Ensure `JWT_REFRESH_SECRET` is added to environment variables
- [ ] Test login, protected routes, and automatic refresh flow
- [ ] Verify cookies are set correctly (HTTP-only, Secure, SameSite)
