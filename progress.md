# INNEED — Progress

## Sprint 1 ✅

**Status:** Complete
**Date:** 2026-03-18

### Completed
- POST /auth/otp/request + /auth/otp/verify (mock SMS, user upsert)
- POST /auth/register, /auth/login (bcrypt), /auth/google
- JWT httpOnly cookies: access_token (15min) + refresh_token (7d) with rotation
- POST /auth/refresh, GET /auth/me, POST /auth/logout
- POST /vendor/onboarding + presigned URL (R2)
- GET /admin/vendors/pending, approve/reject
- Frontend: Login (OTP + email tabs), Signup, Vendor 4-step wizard, Admin approvals
- Next.js middleware route guards

---

## Sprint 0 ✅

**Status:** Complete
**Date:** 2026-03-18

### Completed
- Root monorepo with pnpm workspaces (frontend, backend, shared)
- `@inneed/shared`: TypeScript interfaces + Zod schemas
- Backend: Fastify 5 + Prisma 5 + all dependencies installed
- Prisma schema: 30 models (User, VendorProfile, Listing, Order, Rental, etc.)
- Database migration applied to local PostgreSQL 16
- Frontend: Next.js 16 + Tailwind CSS + Shadcn/ui + TanStack Query
- Docker Compose: PostgreSQL 16 + Redis 7 configured
- `.env.example` for both backend and frontend
- Both projects compile without TypeScript errors

### Notes
- Docker not running locally; using native PostgreSQL (apple@localhost:5432/inneed)
- Redis URL configured for localhost:6379 (ensure Redis is running before Sprint 1)
