# INNEED — Project Roadmap

> **Version**: 1.0
> **Last Updated**: March 2026
> **Status**: Draft

---

## Phase Overview

| Phase | Timeline | Focus | Deliverable |
|-------|----------|-------|-------------|
| **Phase 1: MVP** | Weeks 1-18 | Core rent/buy marketplace | Public launch in 2-3 cities |
| **Phase 2: Growth** | Months 5-8 | Chat, mobile app, advanced search | Scale to 10K users |
| **Phase 3: Scale** | Months 9-12 | Delivery, subscriptions, multi-language | National expansion |
| **Phase 4: Expansion** | Year 2 | International, AI, B2B | Global marketplace |

---

## Phase 1: MVP (Weeks 1-18)

### Sprint 0: Foundation (Weeks 1-2)

**Goal**: Set up the project infrastructure so development can begin on features.

| Task | Details |
|------|---------|
| Monorepo setup | Initialize `frontend/`, `backend/`, `shared/`, `docs/` with workspace config |
| Next.js 16 project | Create app with App Router, Tailwind CSS, Shadcn/ui components |
| Fastify 5 project | Create API with TypeScript, Prisma, Zod, Swagger auto-docs |
| Shared types package | Create `@inneed/shared` with core TypeScript interfaces and Zod schemas |
| Docker Compose | PostgreSQL 16 + Redis 7 + MinIO (S3 mock) for local development |
| Prisma schema | Define all MVP models (see `04-DATABASE-ERD.md`), run initial migration |
| Environment setup | `.env.example` for both projects, document all required variables |
| CI/CD pipeline | GitHub Actions: lint, type-check, test, build on every PR |
| Design system | Set up Tailwind CSS variables, color palette, typography, spacing tokens |
| Component library | Initialize Shadcn/ui, add core components: Button, Input, Dialog, Card, Table, Badge, Select, Tabs |
| ESLint + Prettier | Configure consistent code style across frontend and backend |
| Git workflow | Branch protection on main, PR reviews, conventional commits |

**Exit criteria**: Both projects run locally, connect to local DB, CI passes green.

---

### Sprint 1: Authentication + Vendor Onboarding (Weeks 3-4)

**Goal**: Users can register, log in, and vendors can complete onboarding.

#### Backend

| Task | Details |
|------|---------|
| Phone OTP auth | `POST /auth/otp/request` + `POST /auth/otp/verify` with MSG91 |
| OTP security | bcrypt hash OTPs before storage, 5-min TTL, rate limit 5/15min |
| Email + password auth | `POST /auth/register` + `POST /auth/login` |
| Google OAuth | `POST /auth/google` with ID token verification |
| JWT in cookies | Access token (15min) + refresh token (7d) in httpOnly cookies |
| Token refresh | `POST /auth/refresh` with token rotation |
| Session management | Create/delete sessions in DB, logout endpoint |
| `GET /auth/me` | Return current user profile |
| Password reset | OTP-based password reset flow |
| Vendor onboarding | `POST /vendor/onboarding` — business info, address, document upload |
| Document upload | Presigned URL for vendor KYC documents (Aadhaar, PAN, etc.) |
| Admin vendor approval | `GET /admin/vendors/pending` + `POST /admin/vendors/:id/approve` |

#### Frontend

| Task | Details |
|------|---------|
| Login page | Phone OTP + email/password + Google OAuth UI |
| Signup page | Two-step: details → OTP verification |
| Forgot password page | OTP-based reset flow |
| Auth context | Global auth state, auto-refresh, logout |
| Route protection | Middleware for auth-required, vendor-required, admin-required routes |
| Vendor onboarding wizard | 4-step form: business info → address → ID upload → review & submit |
| Admin vendor approvals page | List pending vendors, view documents, approve/reject |
| API client setup | Single Axios instance with cookie-based auth |

**Exit criteria**: Full auth flow works end-to-end. Vendor can register, onboard, and get approved by admin.

---

### Sprint 2: Catalog + Discovery (Weeks 5-6)

**Goal**: Vendors can create listings. Customers can browse, search, and view items.

#### Backend

| Task | Details |
|------|---------|
| Category CRUD (admin) | Create, update, reorder, deactivate categories |
| Listing CRUD (vendor) | Create, update, pause, archive listings with validation |
| Image upload | Presigned URLs for listing images (up to 10, max 5MB, JPEG/PNG/WebP) |
| Search endpoint | `GET /listings` with full-text search (pg_trgm), pagination |
| Filters | Category, price range, condition, mode (rent/buy), verified vendor |
| Proximity sorting | Haversine distance calculation, closest-first default sort |
| Listing detail | `GET /listings/:id` with vendor info, pricing, reviews, availability |
| Availability check | `GET /listings/:id/availability?start=&end=` — check against existing rentals |
| Vendor profile | `GET /vendors/:id` with listings, metrics |

#### Frontend

| Task | Details |
|------|---------|
| Homepage | Hero section, category cards, featured items, nearby items |
| Category page | Listings filtered by category with sidebar filters, grid/list toggle |
| Search results page | Search bar, results grid, filter panel, sort options |
| Item detail page | Image gallery, pricing (rent/buy), availability calendar, vendor card, reviews |
| Vendor profile page | Vendor info, listing grid, rating |
| Vendor listing management | Table of vendor's listings, create/edit/pause/archive |
| Create listing form | Multi-step: basic info → pricing → images → preview |
| Edit listing form | Pre-populated form for editing |
| Admin category management | CRUD interface for categories |
| Admin listing moderation | List flagged/all listings, approve/flag/remove |

**Exit criteria**: Vendor can create listings with images and pricing. Customer can browse, search, filter, and view item details with proximity-based sorting.

---

### Sprint 3: Cart + Checkout + Payments (Weeks 7-9)

**Goal**: Customers can rent or buy items and pay via Razorpay.

#### Backend

| Task | Details |
|------|---------|
| Cart service | Server-side cart: add, update, remove, clear |
| Cart availability | Re-validate item availability on every cart operation |
| Checkout quote | Calculate pricing: item cost + deposit + commission |
| Commission config | `PlatformConfig` table with admin-configurable commission rates |
| Order creation | Create order with price snapshot, lock availability |
| Razorpay integration | Create Razorpay Order, verify payment signature |
| Razorpay webhooks | Handle `payment.captured`, `payment.failed` events |
| Security deposit hold | Track deposits per rental in `SecurityDepositHold` table |
| Idempotency | Idempotency keys on payment endpoints |
| Order cancellation | Cancel order, trigger refund |
| Refund processing | Initiate refund via Razorpay Refunds API |
| Vendor earnings | Create `LedgerEntry` on order confirmation (vendor share) |

#### Frontend

| Task | Details |
|------|---------|
| Cart page | List cart items, update quantity, remove, total calculation |
| Checkout page | Review items → confirm pickup → select payment → place order |
| Razorpay Checkout.js | Integrate Razorpay payment UI (UPI, cards, etc.) |
| Order confirmation | Success page with order details and pickup instructions |
| TanStack Query setup | Replace all manual data fetching with query hooks |

**Exit criteria**: Full purchase and rental flow works end-to-end. Customer pays via Razorpay, order is confirmed, vendor sees the order.

---

### Sprint 4: Rental Lifecycle + Vendor Operations (Weeks 10-12)

**Goal**: Complete rental lifecycle from booking to return. Vendor dashboard fully functional.

#### Backend

| Task | Details |
|------|---------|
| Rental state machine | Implement all state transitions (see `02-TRD.md` Section 6) |
| Pickup code generation | Generate 6-digit code on booking confirmation, send via SMS |
| Pickup verification | Vendor enters code → system validates → marks PICKED_UP |
| Overdue detection job | pg-boss cron: check for rentals past end date, mark OVERDUE |
| Due reminder job | pg-boss cron: send reminders 2 days before due date |
| Rental extension | Customer requests → system checks availability → vendor approves → additional payment |
| Return processing | Vendor marks returned → inspection form → condition report |
| Deposit release | Auto-release on good condition, hold on damage report |
| Booking requests | `GET /vendor/bookings` + `POST /vendor/bookings/:id/approve` |
| Vendor dashboard stats | Aggregate: active rentals, pending bookings, total earnings |
| Vendor earnings page | Transaction history, available balance, payout requests |
| Payout settings | Vendor configures bank account details |
| Customer order history | List orders with status, detail view, receipt |
| Customer rental tracking | Active rentals with countdown, status, pickup code |

#### Frontend

| Task | Details |
|------|---------|
| Vendor dashboard | Overview with key metrics, recent activity |
| Vendor booking requests | List pending requests, approve/reject UI |
| Vendor active rentals | List active rentals with status, customer info, days remaining |
| Vendor return inspection | Form: condition select, damage notes, photos |
| Vendor earnings page | Revenue charts, transaction table, payout history |
| Vendor payout settings | Bank account form |
| Vendor calendar | Availability calendar showing bookings and blackout dates |
| Customer dashboard | Overview with orders, active rentals, recommendations |
| Customer orders page | Order list with filters, order detail, receipt |
| Customer active rental | Rental detail with countdown, pickup code, extend button |
| Customer rental extension | Extension request form with date picker |

**Exit criteria**: Complete rental lifecycle works: reserve → pickup (code verified) → active → due → return → inspect → close. Vendor can manage all operations from dashboard.

---

### Sprint 5: Reviews + Disputes + Notifications (Weeks 13-15)

**Goal**: Trust and safety features. Full notification system.

#### Backend

| Task | Details |
|------|---------|
| Review creation | `POST /reviews` — only after completed rental/purchase |
| Review listing | `GET /reviews/listing/:id` with pagination |
| Rating aggregation job | Recalculate average on new review (listing + vendor metrics) |
| Dispute creation | `POST /disputes` with type, description, evidence |
| Dispute evidence | `POST /disputes/:id/evidence` — upload photos, add messages |
| Admin dispute resolution | View both sides, communicate, resolve |
| Notification service | Multi-channel dispatcher: in-app, email, SMS |
| In-app notifications | DB-backed, read/unread, linked to events |
| Email notifications | Transactional emails via Resend (order confirmation, receipts, reminders) |
| SMS notifications | OTP, pickup codes, rental reminders, overdue alerts via MSG91 |
| Notification preferences | User can toggle email/SMS per type |
| Admin dispute console | List all disputes, filter by status, resolve |
| Admin transactions page | View all transactions, filter, search |

#### Frontend

| Task | Details |
|------|---------|
| Review form | Star rating + text + optional photos (post-rental/purchase) |
| Reviews display | Reviews list on item detail and vendor profile pages |
| Customer disputes page | List disputes, create new, view detail |
| Dispute detail page | Timeline of messages/evidence, status updates |
| Vendor disputes page | Same as customer but from vendor perspective |
| Notification center | Bell icon with unread count, notification list, mark read |
| Customer settings | Notification preferences toggles |
| Admin dispute console | Full dispute management UI |
| Admin transactions | Transaction table with filters and search |
| Saved items page | Wishlist with save/unsave, browse saved items |
| Customer wallet page | Payment history, deposit status |

**Exit criteria**: Users can leave reviews. Disputes can be filed and resolved. Notifications delivered via all channels.

---

### Sprint 6: Map Discovery + Polish + Launch (Weeks 16-18)

**Goal**: Map-based discovery. Performance optimization. Production deployment.

#### Backend

| Task | Details |
|------|---------|
| Geocoding integration | Google Geocoding API for address → lat/lng conversion |
| Map data endpoint | Listings with lat/lng for map pins, clustered at zoom levels |
| Distance API | Calculate distances for sort and display |
| SEO support | Structured data (JSON-LD) for listings, Open Graph meta |
| Health check | `GET /health` with DB, Redis, external service status |
| Seed data | Create realistic seed data for demo/launch |

#### Frontend

| Task | Details |
|------|---------|
| Map view | Google Maps integration on homepage/search with item pins |
| Map clustering | Cluster nearby pins at low zoom levels |
| Location detection | Browser geolocation + manual city/pincode input |
| Map pin interaction | Click pin → show item card → link to detail |
| Performance optimization | Bundle analysis, code splitting, lazy loading, image optimization |
| SEO | Meta tags, sitemap.xml, robots.txt, structured data |
| Error handling polish | Error boundaries, loading skeletons, empty states on all pages |
| Responsive testing | Test all pages on mobile, tablet, desktop |
| Public pages | About, How It Works, FAQ, Contact, Trust & Safety, Policies |
| Admin featured listings | Manage promoted/featured items |
| Admin analytics | Basic charts: registrations, orders, revenue |
| Admin commission settings | Configure global and per-category commission rates |

#### DevOps

| Task | Details |
|------|---------|
| Production database | Set up Neon PostgreSQL, run migrations, seed initial data |
| Production Redis | Set up Upstash Redis |
| Production storage | Set up Cloudflare R2 bucket, configure CDN |
| Vercel deployment | Connect git repo, configure environment variables |
| Railway deployment | Deploy Fastify app, configure environment variables |
| Domain setup | Configure custom domain (e.g., inneed.in) |
| SSL | Automatic via Vercel + Railway |
| Razorpay live mode | Switch from test to live mode, verify webhook URL |
| MSG91 production | Switch to production SMS plan |
| Sentry | Configure production error tracking |
| Monitoring | Set up health check monitoring (Uptime Robot) |
| Security audit | OWASP checklist, dependency audit, penetration testing basics |
| Launch checklist | Final QA pass on all critical flows |

**Exit criteria**: Platform is live, functional, and accessible at production URL. All critical flows tested end-to-end in production.

---

## Phase 2: Growth (Months 5-8)

**Goal**: Increase engagement and user retention. Mobile presence.

| Feature | Priority | Description |
|---------|----------|-------------|
| **In-app chat** | High | Real-time messaging between customer and vendor (Socket.io). Conversation UI, read receipts, typing indicators. |
| **React Native mobile app** | High | iOS + Android app using Expo. Core flows: browse, rent/buy, manage rentals. Push notifications. |
| **Advanced search** | Medium | Migrate to Meilisearch for faster, typo-tolerant, faceted search. |
| **WhatsApp notifications** | Medium | Send booking confirmations, reminders via WhatsApp Business API (MSG91). |
| **Vendor analytics** | Medium | Detailed analytics: listing views, conversion rates, popular times, revenue trends. |
| **Social sharing** | Low | Share listing links to WhatsApp, Instagram, etc. with rich preview cards. |
| **Late return penalties** | Medium | Automated penalty calculation and notification for overdue rentals. |
| **Audit logs** | Low | Track admin actions for accountability. |
| **PWA capabilities** | Low | Add to homescreen prompt, offline page, web push notifications. |

---

## Phase 3: Scale (Months 9-12)

**Goal**: National expansion. New revenue streams.

| Feature | Priority | Description |
|---------|----------|-------------|
| **Delivery option** | High | Vendors can offer delivery for extra fee. Integration with local logistics (Dunzo, Porter). |
| **Subscription plans** | Medium | Recurring rental subscriptions (monthly tool access for a flat fee). |
| **Rent-to-buy** | Medium | Apply rental payments toward purchase price. Track credits, auto-convert. |
| **Automated KYC** | High | DigiLocker/Aadhaar API for instant vendor verification. |
| **Multi-language (Hindi)** | Medium | Hindi language support for tier-2 cities. i18n framework integration. |
| **AI recommendations** | Medium | Personalized item suggestions based on browsing/rental history. |
| **Multi-city expansion** | High | City-specific landing pages, local category customization. |
| **Inventory management** | Medium | Track stock, auto-disable listings when all units rented. |
| **Insurance partnerships** | Low | Partner with insurance providers for high-value item coverage. |
| **Referral program** | Medium | User referrals with credits for both referrer and referee. |

---

## Phase 4: Expansion (Year 2)

**Goal**: International growth. Platform maturity.

| Feature | Priority | Description |
|---------|----------|-------------|
| **Multi-currency** | High | Support USD, EUR, GBP for international markets. |
| **International expansion** | High | Launch in UAE, Southeast Asia, or other markets. |
| **AI chatbot** | Medium | Customer support chatbot using LLM. Handle common queries, escalate complex ones. |
| **B2B marketplace** | Medium | Separate B2B section for business equipment rental at scale. |
| **Vendor financing** | Low | Offer loans/credit to vendors for inventory acquisition. |
| **Advanced admin analytics** | Medium | Cohort analysis, LTV prediction, churn detection, geographic heat maps. |
| **API for partners** | Low | Public API for third-party integrations (comparison sites, etc.). |
| **White-label solution** | Low | Enable other businesses to launch their own rental marketplaces using INNEED platform. |

---

## Risk Mitigation per Phase

### Phase 1 Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Razorpay integration delays | Medium | High | Start Razorpay sandbox testing in Sprint 0. Keep payment module modular. |
| Low vendor supply at launch | High | High | Manually onboard 20-30 vendors before public launch. Focus on 1-2 categories and 1 city. |
| Feature scope creep | High | Medium | Strict sprint boundaries. Features not in plan go to backlog. |
| Single-developer bottleneck | Medium | High | Document everything. Keep modules independent so work can be parallelized later. |
| Performance issues on 3G | Medium | Medium | Test with Chrome DevTools throttling from Sprint 2. Budget for optimization in Sprint 6. |

### Phase 2 Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| React Native learning curve | Medium | Medium | Use Expo (managed workflow). Start with simple screens. |
| WebSocket scaling | Low | Medium | Start with polling fallback. Socket.io handles reconnection. |
| Search migration complexity | Medium | Low | Meilisearch is a clean add-on, doesn't replace PostgreSQL. |

---

## Milestone Summary

```
Week 2  → Project infrastructure ready, local dev working
Week 4  → Auth complete, vendors can onboard
Week 6  → Listings live, search works, items browsable
Week 9  → Payments work, orders created, Razorpay live
Week 12 → Full rental lifecycle, vendor dashboard complete
Week 15 → Reviews, disputes, notifications all working
Week 18 → MAP DISCOVERY LIVE. PRODUCTION LAUNCH. 🚀

Month 6 → In-app chat live
Month 7 → React Native app in app stores
Month 10 → Delivery option launched
Month 12 → 10K users, national presence
```
