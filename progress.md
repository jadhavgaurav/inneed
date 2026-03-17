# INNEED — Progress

## Sprint 3 ✅

**Status:** Complete
**Date:** 2026-03-18

### Completed
- Server-side cart CRUD (add/update/remove/clear)
- POST /checkout/quote: subtotal + deposits + 10% commission
- POST /checkout: Order creation with cart clear
- POST /payments/create-order: Razorpay order in paise
- POST /payments/verify: HMAC signature verification, confirms order, creates Rentals + DepositHold + LedgerEntry
- POST /payments/webhook: Razorpay event handling
- GET /orders/:id, GET /orders (customer history)
- Frontend: Cart page, Checkout with Razorpay.js, Order confirmation with pickup codes

---

## Sprint 2 ✅

**Status:** Complete
**Date:** 2026-03-18

### Completed
- Admin Category CRUD + public GET /categories
- Vendor Listing CRUD + presigned image URLs (R2)
- GET /listings: full-text search (ilike), pagination, category/price/condition/mode filters
- GET /listings/:id: listing + pricing + vendor + media + reviews
- Frontend: Homepage (hero, category grid, featured listings, how it works)
- Frontend: Search results with sidebar filters
- Frontend: Item detail page (gallery, pricing, date picker, vendor card, reviews)
- Frontend: Vendor listing management table + create listing form

---

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
