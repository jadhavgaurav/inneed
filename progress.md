# INNEED — Progress

## ALL SPRINTS COMPLETE ✅ INNEED IS READY TO LAUNCH 🚀

---

## Sprint 6 ✅

**Status:** Complete
**Date:** 2026-03-18

### Completed
- Seed script: admin, 5 vendors, 15 listings across 8 categories, test customer
- PlatformConfig seeded with commission_rate=0.10 and max_rental_days=30
- Admin analytics page: total users, listings, orders, revenue stats + config display
- Public pages: /about, /how-it-works, /faq, /contact
- Enhanced footer with multi-column links (renters/vendors/company sections)
- sitemap.ts + robots.ts for SEO crawling
- Root layout metadata: title template, description, keywords, OpenGraph
- Google Maps integration: ListingsMap component with marker pins + InfoWindow popups
- Map/Grid toggle on search results page (dynamic import)
- Graceful fallback when GOOGLE_MAPS_KEY not configured

### Test Accounts (via pnpm --filter backend db:seed)
- Admin:    admin@inneed.in / admin123
- Vendor:   rahul@example.com / vendor123
- Customer: customer@example.com / customer123

---

## Sprint 5 ✅

**Status:** Complete
**Date:** 2026-03-18

### Completed
- POST /reviews: one-per-orderLine, updates ListingPricing averageRating + totalReviews
- GET /listings/:id/reviews + GET /vendor/reviews (paginated)
- POST /disputes: file dispute against order with DisputeType enum + initial evidence
- GET /disputes/:id: dispute detail with evidence thread (auth-gated)
- POST /disputes/:id/evidence: add evidence by either party
- GET + POST /admin/disputes: admin dispute queue + resolve with deposit adjustment
- GET /notifications + /unread-count + POST /notifications/read
- Notification helpers: notifyOrderConfirmed, notifyRentalApproved, notifyReturnReminder, notifyDisputeOpened, notifyDisputeResolved
- GET/POST/DELETE /saved: wishlist CRUD, GET /saved/:id/check
- Frontend: Notification bell with unread badge (30s polling)
- Frontend: /notifications — full notification center with mark-as-read
- Frontend: /saved — saved items grid with heart toggle
- Frontend: Heart save button on item detail page
- Frontend: /customer/disputes — dispute list + evidence thread
- Frontend: /vendor/disputes — vendor dispute view + response
- Frontend: /admin/disputes — admin resolve console with deposit adjustment
- UI components created: Button, Badge, Card, Input, Label, Textarea, Separator, Select

---

## Sprint 4 ✅

**Status:** Complete
**Date:** 2026-03-18

### Completed
- Rental state machine: approve → ready_for_pickup → pickup (code verify) → return (condition) → closed/disputed
- Extension request + vendor approval
- pg-boss hourly job: ACTIVE → DUE → OVERDUE for overdue rentals
- SecurityDepositHold auto-released on good return
- Vendor: dashboard, bookings, earnings ledger
- Customer: rentals (pickup code display) + order history
- Frontend: all pages for vendor management and customer tracking

---

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
