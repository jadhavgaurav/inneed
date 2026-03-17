# INNEED — Technical Requirements Document (TRD)

> **Version**: 1.0
> **Last Updated**: March 2026
> **Status**: Draft

---

## 1. System Overview

INNEED is a client-server marketplace application with:

- **Web Client**: Next.js 16 (server-rendered + client-interactive)
- **API Server**: Fastify 5 (REST API)
- **Database**: PostgreSQL 16 (primary data store)
- **Cache**: Redis (sessions, rate limiting, temporary data)
- **Object Storage**: Cloudflare R2 (images, documents)
- **External Services**: Razorpay (payments), MSG91 (SMS/OTP), Google OAuth, Google Maps

### Monorepo Structure

```
inneed/
├── frontend/          # Next.js 16 web application
├── backend/           # Fastify 5 REST API
├── shared/            # Shared TypeScript types & constants
├── docs/              # This documentation
├── docker-compose.yml # Local development (PostgreSQL + Redis)
├── .github/           # CI/CD workflows
└── package.json       # Monorepo root (workspace config)
```

---

## 2. Authentication & Authorization

### 2.1 Authentication Methods

| Method | Priority | Use Case |
|--------|----------|----------|
| **Phone + OTP** | Primary | Most Indians have phones; OTP is familiar |
| **Email + Password** | Secondary | Fallback for users who prefer email |
| **Google OAuth** | Tertiary | Quick signup for tech-savvy users |

### 2.2 Phone + OTP Flow

```
Client                          API                         MSG91
  │                              │                            │
  ├─ POST /auth/otp/request ────►│                            │
  │   { phone: "+91..." }        │                            │
  │                              ├─ Validate phone format     │
  │                              ├─ Rate limit check (5/15min)│
  │                              ├─ Generate 6-digit OTP      │
  │                              ├─ Hash OTP (bcrypt)         │
  │                              ├─ Store hash in DB          │
  │                              │   (OtpRequest, TTL: 5min)  │
  │                              ├─ Send OTP via SMS ─────────►│
  │◄─ { message: "OTP sent" } ──┤                            │
  │                              │                            │
  ├─ POST /auth/otp/verify ─────►│                            │
  │   { phone, otp }            │                            │
  │                              ├─ Fetch latest OtpRequest   │
  │                              ├─ Check expiry (5min)       │
  │                              ├─ Verify bcrypt hash match  │
  │                              ├─ Find or create User       │
  │                              ├─ Create Session            │
  │                              ├─ Generate JWT pair         │
  │◄─ Set-Cookie: access_token ─┤                            │
  │◄─ Set-Cookie: refresh_token ┤                            │
  │   { user: {...} }           │                            │
```

### 2.3 Token Strategy

| Token | Type | Lifetime | Storage | Purpose |
|-------|------|----------|---------|---------|
| Access Token | JWT | 15 minutes | httpOnly cookie | API authentication |
| Refresh Token | JWT | 7 days | httpOnly cookie | Silent token refresh |

**Security requirements:**
- Tokens stored in `httpOnly`, `Secure`, `SameSite=Strict` cookies — NOT localStorage
- Access token contains: `userId`, `role`, `isVendorApproved`, `exp`, `iat`
- Refresh token is a unique random string stored in DB (Session table)
- On 401 response, client automatically attempts refresh; if refresh fails, redirect to login
- CSRF token required for state-changing requests (double-submit cookie pattern)

### 2.4 OTP Security

- OTP is a 6-digit numeric code
- **Hashed with bcrypt** (cost factor 10) before storage — never stored as plaintext
- TTL: 5 minutes from generation
- Rate limit: Maximum 5 OTP requests per phone number per 15-minute window
- After 3 failed verification attempts, OTP is invalidated
- Previous unused OTPs are invalidated when a new one is generated

### 2.5 Authorization Model

INNEED uses an **additive capability model**, not exclusive roles:

```
Every user = CUSTOMER (base capabilities)
                │
                └── If isVendorApproved = true → + VENDOR capabilities

ADMIN = Separate role (not self-assignable)
```

**Middleware authorization checks:**

| Capability | Who Can Access | Check |
|------------|---------------|-------|
| Browse, search, view items | Everyone (including unauthenticated) | No auth required |
| Add to cart, checkout, rent, buy | Authenticated users | `requireAuth` middleware |
| Create listings, manage bookings | Approved vendors | `requireAuth` + `requireVendor` middleware |
| Moderate listings, approve vendors | Admins | `requireAuth` + `requireAdmin` middleware |

### 2.6 Google OAuth Flow

```
Client                          API                         Google
  │                              │                            │
  ├─ Google Sign-In button ──────────────────────────────────►│
  │◄─ Google ID Token ──────────────────────────────────────┤│
  │                              │                            │
  ├─ POST /auth/google ─────────►│                            │
  │   { idToken }               │                            │
  │                              ├─ Verify token with Google  │
  │                              ├─ Extract email, name       │
  │                              ├─ Find or create User       │
  │                              ├─ Generate JWT pair         │
  │◄─ Set-Cookie: tokens ───────┤                            │
```

### 2.7 Password Requirements

- Minimum 8 characters
- At least 1 uppercase, 1 lowercase, 1 number
- Hashed with bcrypt (cost factor 12)
- Password reset via OTP (same flow as phone OTP, sent to registered email/phone)

---

## 3. Catalog & Discovery

### 3.1 Categories

- **Hierarchy**: Two levels — parent category and subcategory
- **Examples**: Power Tools > Drills, Photography > Camera Lenses, Electronics > Projectors
- **Admin-managed**: Only admins can create, edit, reorder, or archive categories
- **Each category has**: name, slug, icon (Lucide icon name), description, parent reference, sort order, active flag

### 3.2 Listings

Each listing represents a physical item available for rent, buy, or both.

**Listing fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Item name (max 100 chars) |
| description | string | Yes | Detailed description (max 2000 chars) |
| categoryId | FK | Yes | Category reference |
| condition | enum | Yes | NEW, LIKE_NEW, GOOD, FAIR, HEAVY_USE |
| images | array | Yes | 1-10 images (max 5MB each) |
| availableForRent | boolean | Yes | Vendor decides |
| availableForSale | boolean | Yes | Vendor decides |
| rentPriceDaily | number | If rent | Daily rental price in INR |
| rentPriceWeekly | number | No | Weekly rate (optional discount) |
| rentPriceMonthly | number | No | Monthly rate (optional discount) |
| buyPrice | number | If sale | Purchase price in INR |
| securityDeposit | number | Yes | Vendor-decided amount (can be ₹0) |
| quantity | number | Yes | Available units (default: 1) |
| features | array | No | Key features as string list |
| pickupAddress | object | Yes | Where customer picks up |
| location | point | Yes | lat/lng for proximity search |
| status | enum | Auto | DRAFT, ACTIVE, PAUSED, ARCHIVED, FLAGGED |

**Listing mode logic:**

| availableForRent | availableForSale | Mode |
|-----------------|-----------------|------|
| true | false | Rent only |
| false | true | Buy only |
| true | true | Both (customer chooses) |
| false | false | Invalid (blocked by validation) |

### 3.3 Search & Discovery

**Search Engine**: PostgreSQL full-text search with `pg_trgm` extension

**Search behavior:**
1. User enters search query (e.g., "power drill")
2. API performs full-text search on `title` and `description` using `ts_vector` + `ts_query`
3. Results filtered by active listings in user's city/region
4. Results sorted by **proximity** (closest vendor first) as primary sort
5. Secondary sort options: relevance, price (low-high / high-low), rating, newest

**Filters:**

| Filter | Type | Options |
|--------|------|---------|
| Category | Select | Dynamic from category list |
| Mode | Radio | Rent, Buy, All |
| Price Range | Slider | Min — Max (INR) |
| Condition | Multi-select | New, Like New, Good, Fair, Heavy Use |
| Distance | Slider | 1 km — 50 km radius |
| Rating | Select | 4+, 3+, any |
| Verified Vendor | Toggle | Show only verified vendors |

### 3.4 Map-Based Discovery

- **Map View**: Google Maps integration showing vendor locations as pins
- **Pin details**: Item name, price, condition badge on hover/tap
- **Clustering**: Nearby pins clustered at low zoom levels
- **Proximity sorting**: Items are ALWAYS sorted by distance to customer (closest first) as the default sort order
- **Customer location**: Detected via browser Geolocation API, with manual city/pincode fallback
- **Distance calculation**: Haversine formula on lat/lng coordinates stored in each listing
- **Upgrade path**: PostGIS extension for advanced geo queries at scale (Phase 3+)

### 3.5 Pagination

| Context | Strategy | Page Size |
|---------|----------|-----------|
| Marketplace feed | Cursor-based (infinite scroll) | 20 items |
| Search results | Cursor-based (infinite scroll) | 20 items |
| Category page | Cursor-based (infinite scroll) | 20 items |
| Admin tables | Offset-based (numbered pages) | 25 rows |
| Order history | Offset-based (numbered pages) | 10 orders |

---

## 4. Cart & Checkout

### 4.1 Cart

- **Server-side**: Cart stored in database (not localStorage) for authenticated users
- **Multi-item**: Supports multiple items from different vendors in one cart
- **Mixed mode**: Cart can contain both rent and buy items simultaneously
- **Cart item data**:
  - Item reference
  - Mode: rent or buy
  - Rental dates (start, end, total days) — if rent mode
  - Damage protection toggle — if rent mode
  - Quantity

### 4.2 Checkout Flow

```
Cart → Review Items → Confirm Pickup Info → Payment → Order Confirmed
```

**At checkout, the system:**
1. Re-validates availability for all rental items (prevents double-booking)
2. Calculates price snapshot:
   - Item price (rental rate × days, or buy price)
   - Security deposit per item (vendor-decided amount)
   - Platform commission (configurable %, default 10%)
   - Total
3. Creates immutable order record with locked prices
4. Initiates Razorpay payment

### 4.3 Pricing Calculation

**For rentals:**
```
Rental cost = Daily rate × Number of days
  (or weekly/monthly rate if applicable and cheaper)
Security deposit = Vendor-set amount (can be ₹0)
Platform fee = Rental cost × Commission rate
Total = Rental cost + Security deposit + Platform fee
```

**For purchases:**
```
Buy price = Vendor-set price
Platform fee = Buy price × Commission rate
Total = Buy price + Platform fee
```

**Commission rate**: Configurable from admin panel. Default 10%. Can be set globally or per category. Stored in a `PlatformConfig` table.

---

## 5. Payments (Razorpay)

### 5.1 Payment Flow

```
Client                      API                       Razorpay
  │                          │                           │
  ├─ POST /payments/create ─►│                           │
  │   { orderId }           │                           │
  │                          ├─ Create Razorpay Order ──►│
  │                          │   { amount, currency,     │
  │                          │     receipt, notes }      │
  │◄─ { razorpayOrderId } ─┤◄─ { id, amount, ... } ───┤
  │                          │                           │
  ├─ Open Razorpay Checkout ─────────────────────────────►│
  │   (UPI / Card / NB)     │                           │
  │◄─ Payment success ──────────────────────────────────┤│
  │   { razorpay_payment_id,│                           │
  │     razorpay_order_id,  │                           │
  │     razorpay_signature }│                           │
  │                          │                           │
  ├─ POST /payments/verify ─►│                           │
  │   { payment_id,         │                           │
  │     order_id, signature }│                           │
  │                          ├─ Verify HMAC signature    │
  │                          ├─ Update order status      │
  │                          ├─ Create Payment record    │
  │◄─ { order: CONFIRMED } ─┤                           │
  │                          │                           │
  │                          │◄─ Webhook: payment.captured│
  │                          ├─ Double-check + finalize  │
```

### 5.2 Security Deposit Handling

- Vendor sets deposit amount per listing (₹0 to any amount)
- Deposit is collected as part of the total payment
- Tracked as a separate `SecurityDepositHold` record in the database
- **Release conditions:**
  - Vendor marks item as returned in good condition → Full deposit refunded
  - Vendor reports damage → Admin mediates, partial/no refund
  - Rental period expires + 7-day grace period with no return → Deposit forfeited to vendor
- Refunds processed via Razorpay Refunds API

### 5.3 Vendor Payouts

- Platform collects full payment from customer
- Vendor's share = Total - Platform commission - Security deposit hold
- **Payout methods (via Razorpay):**
  - Razorpay Route (automatic split at payment time) — preferred
  - Manual bank transfer via Razorpay Payouts API — fallback
- **Payout schedule**: Rolling 7-day settlement (configurable by admin)
- Vendor configures bank account details in payout settings
- All payout transactions logged in `LedgerEntry` table

### 5.4 Refunds

| Scenario | Refund Amount | Initiated By |
|----------|--------------|--------------|
| Vendor rejects booking | Full refund | Automatic |
| Customer cancels before pickup | Full refund minus cancellation fee (if applicable) | Customer request |
| Customer cancels after pickup | No refund (dispute process) | N/A |
| Item not as described | Full or partial refund | Admin decision |
| Security deposit return | Deposit amount | Automatic on successful return |

### 5.5 Idempotency

- All payment-related endpoints require an `Idempotency-Key` header
- Key is stored with the transaction result
- Duplicate requests with the same key return the cached result
- Keys expire after 24 hours

---

## 6. Rental Lifecycle

### 6.1 State Machine

```
                                    ┌─────────────┐
                                    │   RESERVED   │◄── Order confirmed
                                    └──────┬──────┘
                                           │ Vendor marks ready
                                    ┌──────▼──────┐
                                    │READY_FOR_    │
                                    │  PICKUP      │
                                    └──────┬──────┘
                                           │ Customer picks up (code verified)
                                    ┌──────▼──────┐
                                    │  PICKED_UP   │
                                    └──────┬──────┘
                                           │ Auto-transition (immediate)
                                    ┌──────▼──────┐
                                    │   ACTIVE     │
                                    └──────┬──────┘
                                           │ End date approaching (2 days)
                                    ┌──────▼──────┐
                                    │    DUE       │
                                    └──────┬──────┘
                                      ┌────┴────┐
                            On time   │         │ Past due date
                              ┌───────▼──┐  ┌──▼────────┐
                              │ RETURNED  │  │  OVERDUE   │
                              └─────┬─────┘  └─────┬─────┘
                                    │              │ Eventually returned
                              ┌─────▼─────┐  ┌────▼──────┐
                              │ INSPECTED  │  │ RETURNED   │
                              └─────┬─────┘  └────┬──────┘
                                    │              │
                              ┌─────▼─────┐  ┌────▼──────┐
                              │  CLOSED    │  │ INSPECTED  │
                              └───────────┘  └────┬──────┘
                                                   │
                                             ┌─────▼─────┐
                                             │  CLOSED    │
                                             └───────────┘

  At any point after PICKED_UP:
     ┌───────────┐
     │ DISPUTED  │◄── Either party raises dispute
     └───────────┘
```

### 6.2 Rental Events

Every state transition creates a `RentalEvent` record:

| Event | Triggered By | Data |
|-------|-------------|------|
| `RESERVED` | System (on payment) | Order reference, dates |
| `READY_FOR_PICKUP` | Vendor | Pickup code generated |
| `PICKED_UP` | Vendor (code verified) | Pickup timestamp, code |
| `ACTIVE` | System (auto) | Start date |
| `DUE` | System (cron job) | Due date, days remaining |
| `OVERDUE` | System (cron job) | Days overdue, penalty amount |
| `RETURNED` | Vendor | Return timestamp |
| `INSPECTED` | Vendor | Condition report, damage notes |
| `CLOSED` | System | Deposit release details |
| `DISPUTED` | Customer or Vendor | Dispute reference |
| `EXTENDED` | Customer (approved by vendor) | New end date, additional payment |

### 6.3 Pickup Verification

- On booking confirmation, system generates a **6-digit alphanumeric pickup code**
- Code sent to customer via SMS and displayed in app
- At pickup, customer shares code with vendor
- Vendor enters code in app → System verifies → Marks as PICKED_UP
- Code is single-use and expires after 48 hours

### 6.4 Rental Extension

```
1. Customer requests extension (new end date)
2. System checks availability for extended period
3. System calculates additional cost
4. Vendor receives extension request → Approves or rejects
5. If approved: Customer pays additional amount via Razorpay
6. Rental end date updated, new RentalEvent logged
```

### 6.5 Overdue Handling

- **Background job** (pg-boss) runs every hour checking for overdue rentals
- When rental end date passes:
  - Status changes to `OVERDUE`
  - Customer notified via in-app + SMS
  - Daily penalty calculated (rate = daily rental price, configurable)
  - Vendor notified
- After 7 days overdue: Admin notified, potential deposit forfeiture

### 6.6 Return Inspection

Vendor inspects the returned item and reports:

| Condition | Action |
|-----------|--------|
| **Good** | Full deposit refunded to customer |
| **Minor wear** | Full deposit refunded (normal use) |
| **Damaged** | Vendor documents damage + photos → Dispute auto-created → Admin mediates deposit |
| **Missing parts** | Same as damaged |
| **Not returned** | After 7-day grace, deposit forfeited to vendor |

---

## 7. Communication

### 7.1 In-App Chat (Phase 2)

- **Technology**: Socket.io on Fastify backend
- **Persistence**: Messages stored in PostgreSQL (Conversation + Message tables)
- **Features**: Text messages, read receipts, typing indicators
- **Context**: Conversations are linked to orders/bookings
- **Trigger**: Customer can message vendor from item detail page or active booking

### 7.2 Phone/WhatsApp Reveal (MVP)

- After a booking is **confirmed** (payment complete), the vendor's phone number is revealed to the customer
- Customer can contact vendor directly via phone or WhatsApp for pickup coordination
- Phone number is NOT shown before booking (privacy protection)

### 7.3 Notifications

**Channels:**

| Channel | Service | Use Case |
|---------|---------|----------|
| In-app | Database-backed | All notifications (primary) |
| Email | Resend (or SendGrid) | Order confirmations, receipts, dispute updates |
| SMS | MSG91 | OTP, pickup code, rental reminders, overdue alerts |
| Push | Firebase Cloud Messaging | Mobile app (Phase 2) |
| WhatsApp | MSG91 WhatsApp API | Optional, high-priority alerts (Phase 2) |

**Notification triggers:**

| Event | In-App | Email | SMS |
|-------|--------|-------|-----|
| OTP request | — | — | Yes |
| Registration complete | Yes | Yes | — |
| Vendor onboarding submitted | Yes | Yes | — |
| Vendor approved/rejected | Yes | Yes | Yes |
| New booking request (vendor) | Yes | Yes | Yes |
| Booking approved (customer) | Yes | Yes | Yes |
| Booking rejected (customer) | Yes | Yes | — |
| Pickup code generated | Yes | — | Yes |
| Rental starts | Yes | — | — |
| Rental due in 2 days | Yes | Yes | Yes |
| Rental overdue | Yes | Yes | Yes |
| Return confirmed | Yes | Yes | — |
| Deposit refunded | Yes | Yes | — |
| New review received (vendor) | Yes | Yes | — |
| Dispute created | Yes | Yes | Yes |
| Dispute resolved | Yes | Yes | Yes |
| Payout processed (vendor) | Yes | Yes | — |

### 7.4 Notification Preferences

Users can configure per-channel preferences in settings:
- Email notifications: on/off
- SMS notifications: on/off (OTP always on)
- Push notifications: on/off (Phase 2)

---

## 8. Map & Location

### 8.1 Google Maps Integration

- **Maps JavaScript API**: Map view on homepage/search with item pins
- **Geocoding API**: Convert address to lat/lng during vendor onboarding
- **Places API**: Address autocomplete for location input fields
- **Distance Matrix API**: Calculate distance between customer and vendor (optional, can use Haversine)

### 8.2 Customer Location Detection

```
1. On first visit: Request browser Geolocation permission
2. If granted: Use lat/lng for proximity sorting
3. If denied: Show city selector (dropdown or search)
4. Store preference in:
   - Authenticated: User profile
   - Anonymous: localStorage
5. "Change location" option always available in header
```

### 8.3 Proximity Sorting Algorithm

```sql
-- Haversine distance calculation in PostgreSQL
SELECT *,
  (6371 * acos(
    cos(radians(:userLat)) * cos(radians(lat)) *
    cos(radians(lng) - radians(:userLng)) +
    sin(radians(:userLat)) * sin(radians(lat))
  )) AS distance_km
FROM listings
WHERE status = 'ACTIVE'
  AND city = :userCity
ORDER BY distance_km ASC
LIMIT 20 OFFSET :offset;
```

- Default sort order for all discovery views: **closest first**
- User can override with: price, rating, newest
- Listings beyond 50km radius are deprioritized but still shown

### 8.4 Vendor Location Storage

- During onboarding: Vendor enters pickup address
- Address geocoded to lat/lng via Google Geocoding API
- Stored in `VendorLocation` table: `latitude FLOAT`, `longitude FLOAT`
- Each listing inherits vendor's location (or can override with custom pickup point)

---

## 9. Reviews & Ratings

### 9.1 Review Rules

- Only customers who have completed a rental or purchase can leave a review
- One review per customer per order line item
- Reviews cannot be edited after 7 days
- Reviews can be reported (flagged for admin review)

### 9.2 Review Data

| Field | Type | Details |
|-------|------|---------|
| rating | integer | 1-5 stars (required) |
| comment | string | Text review (optional, max 1000 chars) |
| images | array | Up to 3 photos (optional) |
| helpful | integer | "Was this helpful?" vote count |

### 9.3 Rating Aggregation

- **Item rating**: Average of all reviews for that listing
- **Vendor rating**: Average of all reviews across all vendor's listings
- Aggregated ratings stored in `ListingPricing.averageRating` and `VendorMetrics.averageRating`
- Updated via background job on new review (not real-time)

---

## 10. Disputes

### 10.1 Dispute Types

| Type | Description | Who Can File |
|------|-------------|-------------|
| `ITEM_NOT_AS_DESCRIBED` | Item doesn't match listing description/photos | Customer |
| `DAMAGED_ITEM` | Item was damaged when received | Customer |
| `MISSING_PARTS` | Item is missing components | Customer |
| `LATE_RETURN` | Customer hasn't returned item | Vendor |
| `RETURN_DAMAGE` | Item returned in damaged condition | Vendor |
| `PAYMENT_ISSUE` | Payment or refund related | Either |
| `OTHER` | Any other issue | Either |

### 10.2 Dispute Flow

```
OPEN → UNDER_REVIEW → RESOLVED / CLOSED
```

1. Party creates dispute with description + evidence (photos)
2. Other party notified → Can respond with their evidence
3. Admin reviews in dispute console
4. Admin can message both parties for clarification
5. Admin resolves with one of:
   - Full refund to customer
   - Partial refund
   - Deposit adjustment
   - No action (dismiss)
   - Custom resolution

### 10.3 Evidence

- Up to 5 images per dispute message
- Uploaded to Cloudflare R2 with authenticated presigned URLs
- Evidence is immutable once submitted (cannot be deleted)

---

## 11. Admin Panel

### 11.1 Vendor Approval Workflow

```
Vendor submits onboarding → Status: PENDING
                               │
                    Admin reviews documents
                               │
                    ┌──────────┴──────────┐
                    │                     │
              Approve (+ reason)    Reject (+ reason)
                    │                     │
              Status: APPROVED      Status: REJECTED
              isVendorApproved=true  Vendor notified
              Vendor notified        Can re-apply
```

### 11.2 Listing Moderation

- New listings go to status `ACTIVE` by default (can change to require approval)
- Admin can:
  - **Flag** a listing (status → FLAGGED, hidden from search)
  - **Remove** a listing (status → ARCHIVED, vendor notified with reason)
  - **Edit** a listing (correct pricing, description — vendor notified)
  - **Approve** a flagged listing back to ACTIVE

### 11.3 Commission Configuration

- **Global default**: Stored in `PlatformConfig` table (e.g., `commission_rate: 10`)
- **Per-category override**: Optional commission rate per category
- **Calculation precedence**: Category rate > Global default
- **Admin UI**: Simple form to set global rate + table of category overrides
- Changes apply to NEW orders only (existing orders use locked-in rate)

### 11.4 Analytics Dashboard (Basic - MVP)

| Metric | Chart Type |
|--------|-----------|
| New registrations (daily/weekly) | Line chart |
| Active vendors | Counter |
| Active listings | Counter |
| Orders this week/month | Bar chart |
| Revenue this week/month | Line chart |
| Dispute rate | Percentage counter |
| Top categories by transactions | Horizontal bar |
| Top cities by volume | Table |

---

## 12. Non-Functional Requirements

### 12.1 Performance

| Metric | Target |
|--------|--------|
| API response time (p50) | < 100ms |
| API response time (p95) | < 200ms |
| API response time (p99) | < 500ms |
| Page load (First Contentful Paint) | < 1.5s |
| Page load (Largest Contentful Paint) | < 3s on 3G |
| Time to Interactive | < 3.5s |
| Image load (CDN-optimized) | < 1s per image |
| Search results returned | < 300ms |
| Map render (initial) | < 2s |

**Optimization strategies:**
- Server-Side Rendering (SSR) for SEO pages (homepage, category, item detail)
- Static generation for public pages (about, FAQ, policies)
- Image optimization: WebP format, responsive sizes, CDN delivery via Cloudflare
- Database query optimization: proper indexes, connection pooling
- Redis caching for: categories, popular searches, user sessions
- Lazy loading for below-fold content and images

### 12.2 Security

**OWASP Top 10 Coverage:**

| Risk | Mitigation |
|------|-----------|
| Injection (SQL/NoSQL) | Prisma ORM (parameterized queries), Zod input validation |
| Broken Authentication | httpOnly JWT cookies, bcrypt hashing, OTP rate limiting |
| Sensitive Data Exposure | HTTPS everywhere, no secrets in client bundle, encrypted at rest |
| XML External Entities | Not applicable (JSON-only API) |
| Broken Access Control | Role-based middleware on every protected route |
| Security Misconfiguration | Helmet headers, CORS whitelist, env variable validation |
| Cross-Site Scripting (XSS) | React auto-escaping, Content Security Policy headers |
| Insecure Deserialization | Zod schema validation on all request bodies |
| Known Vulnerabilities | Automated dependency scanning (npm audit, Dependabot) |
| Insufficient Logging | Structured logging (Pino), Sentry error tracking |

**Additional security measures:**
- Rate limiting on all public endpoints (configurable per route)
- CSRF protection (double-submit cookie pattern)
- File upload validation: type whitelist (JPEG, PNG, WebP, PDF), size limit (5MB), authenticated presigned URLs
- Input sanitization on all text fields
- SQL injection impossible via Prisma's parameterized queries
- No raw SQL in application code

### 12.3 Scalability

**Design for 10K users, 1K concurrent:**

| Component | Strategy |
|-----------|----------|
| API Server | Stateless (no in-memory sessions) → horizontal scaling |
| Database | Connection pooling (PgBouncer or Prisma pool), read replicas (Phase 3) |
| Cache | Redis for hot data, sessions, rate limiting |
| File Storage | Cloudflare R2 (unlimited scale, CDN-backed) |
| Search | PostgreSQL full-text (good to ~100K listings) → Meilisearch (Phase 2) |
| Background Jobs | pg-boss (PostgreSQL-backed, survives restarts) |

### 12.4 Reliability

- **Database transactions** for all financial operations (order creation, payments, refunds, payouts)
- **Idempotency keys** on payment endpoints (prevent double-charges)
- **Graceful error handling** with user-friendly messages (no stack traces in production)
- **Health check endpoint** (`GET /health`) returning DB/Redis/external service status
- **Circuit breaker** pattern for external services (Razorpay, MSG91, Google Maps)
- **Retry logic** with exponential backoff for transient failures

### 12.5 Compliance

**India Data Protection & Digital Personal Data (DPDP) Act:**
- User data deletion capability (account + data erasure on request)
- Clear privacy policy explaining data collection and usage
- Consent collection before data processing
- Data stored in India-region servers (Neon India region, R2 Mumbai)

**Financial compliance:**
- 7-year retention for all financial transaction records
- GST-compliant invoicing (future phase)
- Razorpay handles PCI-DSS compliance for card data

### 12.6 Observability

| Tool | Purpose |
|------|---------|
| **Pino** | Structured JSON logging (request ID, user ID, timing) |
| **Sentry** | Error tracking with stack traces, breadcrumbs |
| **Vercel Analytics** | Frontend performance (Web Vitals, page load times) |
| **Uptime Robot** | Health check monitoring, alerting |
| **Razorpay Dashboard** | Payment analytics, dispute tracking |

**Log format:**
```json
{
  "level": "info",
  "timestamp": "2026-03-18T10:30:00Z",
  "requestId": "req_abc123",
  "userId": "user_xyz",
  "method": "POST",
  "path": "/api/v1/orders",
  "statusCode": 201,
  "duration": 145,
  "message": "Order created successfully"
}
```

---

## 13. File Upload

### 13.1 Upload Flow

```
Client                      API                     Cloudflare R2
  │                          │                           │
  ├─ POST /upload/presign ──►│                           │
  │   { fileName, fileType,  │                           │
  │     context: "listing" } │                           │
  │                          ├─ Validate auth            │
  │                          ├─ Validate file type/size  │
  │                          ├─ Generate presigned URL ──►│
  │◄─ { uploadUrl, fileKey }┤◄─ { presignedUrl } ──────┤
  │                          │                           │
  ├─ PUT (direct upload) ───────────────────────────────►│
  │   [file binary]          │                           │
  │◄─ 200 OK ──────────────────────────────────────────┤│
  │                          │                           │
  ├─ POST /listings ────────►│                           │
  │   { ..., images: [key] } │                           │
  │                          ├─ Store file keys in DB    │
```

### 13.2 File Constraints

| Parameter | Value |
|-----------|-------|
| Max file size | 5MB per image, 10MB for vendor documents |
| Allowed image types | JPEG, PNG, WebP |
| Allowed document types | JPEG, PNG, PDF (for KYC) |
| Max images per listing | 10 |
| Max images per review | 3 |
| Max evidence per dispute | 5 |
| CDN delivery | Cloudflare CDN (automatic with R2) |
| Image optimization | Cloudflare Image Transformations (resize, WebP conversion) |

---

## 14. Background Jobs

Using **pg-boss** (PostgreSQL-backed job queue):

| Job | Schedule | Description |
|-----|----------|-------------|
| `check-overdue-rentals` | Every 1 hour | Flag rentals past end date as OVERDUE |
| `send-due-reminders` | Every 6 hours | Send reminders for rentals due in 2 days |
| `process-deposit-release` | Every 1 hour | Auto-release deposits for inspected returns |
| `aggregate-ratings` | On new review | Recalculate item and vendor average ratings |
| `cleanup-expired-otps` | Every 15 min | Delete expired OTP records |
| `cleanup-expired-carts` | Daily | Clear carts older than 7 days |
| `vendor-payout-processing` | Daily | Process pending payouts to vendors |
| `send-notification` | On event | Dispatch notifications to configured channels |

---

## 15. API Versioning

- All endpoints prefixed with `/api/v1/`
- Version in URL path (not header) for simplicity
- Breaking changes → new version (`/api/v2/`)
- Non-breaking changes (new fields, new endpoints) added to current version
- Old versions supported for 6 months after deprecation
