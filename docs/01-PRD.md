# INNEED — Product Requirements Document (PRD)

> **Version**: 1.0
> **Last Updated**: March 2026
> **Status**: Draft

---

## 1. Executive Summary

INNEED is a peer-to-peer marketplace where anyone can rent or buy physical goods — tools, equipment, appliances, electronics, furniture, and more — from people nearby. Think of it as **"Airbnb for things."**

Vendors (individuals or small businesses) list their idle assets with pricing for rent, sale, or both. Customers discover nearby items via map-based search, rent for a specific duration or buy outright, pay securely through Razorpay, and pick up directly from the vendor. The platform earns a configurable commission on every transaction.

**Target Market**: India (tier-1 and tier-2 cities), expanding globally in later phases.

**Business Model**: Marketplace commission (default 10%, configurable by admin per category or globally) on every completed transaction.

---

## 2. Problem Statement

### The Problem
Physical goods — power tools, camera equipment, camping gear, kitchen appliances, party supplies — sit idle 90%+ of the time after purchase. Meanwhile:

- **Buyers pay full price** for items they use once or twice a year
- **Owners can't monetize** idle inventory sitting in their homes and garages
- **Environmental waste** increases as people buy items they barely use

### Why Existing Solutions Fall Short

| Solution | Problem |
|----------|---------|
| **OLX / Facebook Marketplace** | Classifieds only — no rental, no trust layer, no payment protection, no logistics |
| **Rentomojo / RentoMojo** | B2C subscription model — limited catalog, no P2P, vendor-locked inventory |
| **Amazon / Flipkart** | Buy-only — no rental option, massive overhead for casual sellers |
| **Local rental shops** | No discovery, no digital presence, no trust verification, cash-only |

### The Opportunity
There is no trusted, technology-enabled platform in India that allows individuals to **rent out their idle physical goods** to people nearby with:
- Verified identity and trust scoring
- Secure digital payments (UPI, cards)
- Rental lifecycle management (pickup, return, inspection)
- Dispute resolution and damage protection
- Map-based proximity discovery

INNEED fills this gap.

---

## 3. Target Users

INNEED uses a **unified account model** (Airbnb-style): every user signs up as a customer. They can optionally become a vendor by completing the vendor onboarding process. One account, one login — no need for separate accounts.

### 3.1 Customer Persona

| Attribute | Detail |
|-----------|--------|
| **Name** | Priya, 28, Bangalore |
| **Occupation** | Marketing manager |
| **Scenario** | Needs a power drill for a weekend home project. Doesn't want to buy one for ₹5,000 when she'll use it twice a year. |
| **Pain Points** | No trusted rental option, OLX listings are for sale only, local shops are inconvenient and cash-only |
| **Goal** | Rent a drill from someone nearby for ₹200/day, pick it up, use it, return it |
| **Tech Comfort** | High — uses UPI daily, orders on Swiggy/Amazon regularly |

### 3.2 Vendor Persona

| Attribute | Detail |
|-----------|--------|
| **Name** | Rajesh, 35, Mumbai |
| **Occupation** | Freelance photographer |
| **Scenario** | Owns camera lenses, tripods, and lighting equipment worth ₹3 lakhs. Uses them for shoots 10 days/month. Rest of the time they sit idle. |
| **Pain Points** | No platform to safely rent out gear, worried about damage/theft, doesn't want the hassle of managing rentals manually |
| **Goal** | List equipment, approve booking requests, earn passive income, have protection against damage |
| **Note** | Rajesh is ALSO a customer — he might rent a drone from another vendor for a shoot |

### 3.3 Admin Persona

| Attribute | Detail |
|-----------|--------|
| **Name** | Platform Operations Team |
| **Responsibilities** | Vendor verification, listing moderation, dispute resolution, category management, platform health monitoring |
| **Goal** | Maintain trust and safety on the platform, ensure smooth transactions, grow vendor supply |

---

## 4. Account Model

### Unified Accounts (Airbnb-style)

Every user has **one account** with additive capabilities:

```
Sign Up → Customer (default)
              │
              ├── Can browse, search, rent, buy, review, dispute
              │
              └── "Become a Vendor" → Complete Onboarding → Admin Approves
                                          │
                                          └── Vendor capabilities unlocked:
                                              ├── Create & manage listings
                                              ├── Approve bookings
                                              ├── Manage rentals & returns
                                              ├── View earnings & payouts
                                              └── Still a customer too!
```

**Key principles:**
- No separate vendor/customer accounts — one login, one profile
- Navigation toggle: "Renting" (customer view) ↔ "My Listings" (vendor view)
- A vendor can rent/buy from other vendors using the same account
- One wallet, one notification center, one settings page
- Admin is a separate role (not available for self-signup)

---

## 5. Complete Feature Set

### 5.1 Customer Features

| # | Feature | Description | Phase |
|---|---------|-------------|-------|
| C1 | **Browse & Discover** | Homepage with categories, featured items, nearby items | MVP |
| C2 | **Map-Based Discovery** | Google Maps view showing nearby items, sorted by proximity (closest first) | MVP |
| C3 | **Search & Filters** | Full-text search with filters: category, price range, condition, mode (rent/buy), distance, rating | MVP |
| C4 | **Item Detail View** | Photos, description, condition, pricing (rent rates + buy price), vendor info, reviews, availability | MVP |
| C5 | **Rent an Item** | Select dates, see pricing breakdown (daily rate × days + deposit + platform fee), add to cart | MVP |
| C6 | **Buy an Item** | Add to cart at buy price, proceed to checkout | MVP |
| C7 | **Shopping Cart** | Multi-item cart with mixed rent/buy items, quantity, damage protection toggle | MVP |
| C8 | **Checkout & Payment** | Razorpay checkout (UPI, cards, net banking, wallets), security deposit hold, order confirmation | MVP |
| C9 | **Order Tracking** | View all orders, order status, order details, receipt | MVP |
| C10 | **Active Rental Management** | View active rentals, days remaining, pickup code, due date alerts | MVP |
| C11 | **Extend Rental** | Request extension on active rental (vendor approves) | MVP |
| C12 | **Return Process** | Initiate return, return checklist, vendor inspection | MVP |
| C13 | **Reviews & Ratings** | Rate and review items after completed rental/purchase (1-5 stars + text) | MVP |
| C14 | **Wishlist / Saved Items** | Save items for later browsing | MVP |
| C15 | **Disputes** | Raise disputes on orders (damage, quality, missing items), upload evidence | MVP |
| C16 | **Notifications** | In-app + email + SMS notifications for orders, rentals, disputes | MVP |
| C17 | **Profile & Settings** | Edit profile, manage addresses, notification preferences, security settings | MVP |
| C18 | **In-App Chat** | Real-time messaging with vendor (coordinate pickup, ask questions) | Phase 2 |
| C19 | **Phone/WhatsApp Reveal** | See vendor's phone after booking confirmation for direct coordination | MVP |
| C20 | **Subscriptions** | Subscribe to recurring rentals (monthly tool access) | Phase 3 |
| C21 | **Rent-to-Buy** | Apply rental payments toward purchase price | Phase 3 |

### 5.2 Vendor Features

| # | Feature | Description | Phase |
|---|---------|-------------|-------|
| V1 | **Vendor Onboarding** | Multi-step wizard: business info, pickup address, ID upload (KYC), review & submit | MVP |
| V2 | **Listing Management** | Create, edit, pause, archive listings with photos, descriptions, category | MVP |
| V3 | **Flexible Pricing** | Set rent price (daily/weekly/monthly), buy price, or both — vendor decides per listing | MVP |
| V4 | **Security Deposit Control** | Set custom deposit amount per listing (₹0 to any amount) — entirely vendor-decided | MVP |
| V5 | **Availability Calendar** | Set availability rules, blackout dates, manage schedule | MVP |
| V6 | **Booking Requests** | View incoming booking requests, approve or reject with reason | MVP |
| V7 | **Active Rental Tracking** | Monitor current rentals, days remaining, pickup/return status | MVP |
| V8 | **Return Inspection** | Inspect returned items, report condition, approve/flag damage | MVP |
| V9 | **Earnings Dashboard** | Total earnings, available balance, pending payouts, transaction history | MVP |
| V10 | **Payout Settings** | Configure bank account for payouts via Razorpay | MVP |
| V11 | **Vendor Profile Page** | Public profile showing listings, rating, reviews, verified badge | MVP |
| V12 | **Dispute Response** | Respond to customer disputes, upload evidence, communicate via platform | MVP |
| V13 | **In-App Chat** | Real-time messaging with customers | Phase 2 |
| V14 | **Vendor Analytics** | Detailed analytics: views, conversion rates, popular items, revenue trends | Phase 2 |
| V15 | **Inventory Management** | Track stock quantities, auto-disable when all units rented | Phase 2 |
| V16 | **Late Return Penalties** | Automated penalty calculation for overdue returns | Phase 2 |
| V17 | **Delivery Option** | Offer delivery for an additional fee | Phase 3 |

### 5.3 Admin Features

| # | Feature | Description | Phase |
|---|---------|-------------|-------|
| A1 | **Admin Dashboard** | Platform overview: users, transactions, revenue, active rentals | MVP |
| A2 | **Vendor Approvals** | Review vendor applications, documents, approve/reject with reason | MVP |
| A3 | **Listing Moderation** | Review flagged listings, approve, edit, or remove | MVP |
| A4 | **Category Management** | Create, edit, delete categories with icons, descriptions, parent/child hierarchy | MVP |
| A5 | **Featured Listings** | Promote specific listings to homepage/category tops | MVP |
| A6 | **Dispute Console** | View all disputes, review evidence, message both parties, resolve | MVP |
| A7 | **User Management** | View all users, suspend/reinstate accounts, view activity | MVP |
| A8 | **Transaction Overview** | View all transactions, filter by status/date/amount | MVP |
| A9 | **Commission Settings** | Configure platform commission rate globally and per category | MVP |
| A10 | **Basic Analytics** | Registration trends, transaction volume, revenue charts | MVP |
| A11 | **Audit Logs** | Track all admin actions for accountability | Phase 2 |
| A12 | **Advanced Analytics** | Cohort analysis, retention, LTV, geographic heat maps | Phase 3 |
| A13 | **Automated KYC** | DigiLocker/Aadhaar API verification for vendors | Phase 3 |

### 5.4 Platform-Wide Features

| # | Feature | Description | Phase |
|---|---------|-------------|-------|
| P1 | **Responsive Web App** | Mobile-first responsive design, works on all devices | MVP |
| P2 | **SEO Optimized** | Meta tags, structured data, sitemap, SSR for discovery pages | MVP |
| P3 | **Multi-Language (Hindi)** | Hindi language support | Phase 3 |
| P4 | **React Native Mobile App** | iOS & Android native apps | Phase 2 |
| P5 | **PWA Capabilities** | Install prompt, offline pages, push notifications | Phase 2 |
| P6 | **Multi-Currency** | USD, EUR support for international expansion | Phase 4 |
| P7 | **AI Chatbot** | Customer support chatbot | Phase 4 |
| P8 | **AI Recommendations** | Personalized item recommendations | Phase 3 |

---

## 6. Core User Flows

### 6.1 Customer Renting an Item

```
1. Browse homepage / Search "power drill" / Open map view
2. See items sorted by proximity (closest first)
3. Click item → View detail page (photos, condition, pricing, vendor info, reviews)
4. Select "Rent" → Choose dates → See breakdown:
   - Daily rate × 3 days = ₹600
   - Security deposit (set by vendor) = ₹500
   - Platform fee (10%) = ₹60
   - Total: ₹1,160
5. Add to Cart → Proceed to Checkout
6. Enter/confirm pickup address → Select payment method
7. Pay via Razorpay (UPI / Card / Net Banking)
8. Order confirmed → Receive pickup code via SMS
9. Go to vendor location → Share pickup code → Collect item
10. Use item for rental period
11. Return item to vendor → Vendor inspects → Marks as returned
12. Security deposit refunded (minus any damage deductions)
13. Leave a review for the item
```

### 6.2 Customer Buying an Item

```
1. Browse / Search → Find item with "Buy" option
2. Click item → View detail page
3. Select "Buy" → See price:
   - Buy price = ₹4,500
   - Platform fee (10%) = ₹450
   - Total: ₹4,950
4. Add to Cart → Checkout → Pay via Razorpay
5. Order confirmed → Coordinate pickup with vendor
6. Pick up item → Order completed
7. Leave a review
```

### 6.3 Becoming a Vendor

```
1. User clicks "Become a Vendor" in profile/settings
2. Step 1: Business Information (name, type, phone, bio)
3. Step 2: Pickup Address (street, city, state, pincode, coordinates)
4. Step 3: Identity Verification (upload government ID — Aadhaar/PAN/Passport)
5. Step 4: Review & Submit
6. Application submitted → Admin notified
7. Admin reviews documents → Approves or rejects (with reason)
8. User notified of approval → Vendor features unlocked
9. User can now create listings and receive bookings
```

### 6.4 Vendor Managing a Rental

```
1. Customer books item → Vendor receives booking request notification
2. Vendor reviews request (dates, customer profile) → Approves or rejects
3. Approved → Pickup code generated → Customer notified
4. Customer arrives → Vendor verifies pickup code → Hands over item
5. Vendor marks "Picked Up" in app
6. Rental period active → Both parties see countdown
7. Customer returns item → Vendor inspects condition
8. Vendor marks "Returned" → Reports condition (good / damaged / missing parts)
9. If good: Security deposit auto-refunded to customer
10. If damaged: Vendor files damage report → Platform mediates deposit release
```

### 6.5 Dispute Resolution

```
1. Customer raises dispute on an order (reason: damage/quality/missing/other)
2. Customer describes issue + uploads evidence (photos)
3. Vendor notified → Can respond with their evidence
4. Admin reviews both sides in dispute console
5. Admin communicates with both parties
6. Admin resolves: full refund / partial refund / deposit adjustment / no action
7. Both parties notified of resolution
```

---

## 7. MVP Scope Boundary

### Included in MVP (Phase 1)
- User registration (phone OTP, email/password, Google OAuth)
- Unified account with vendor onboarding
- Listing CRUD (rent / buy / both, vendor-decided pricing and deposits)
- Map-based discovery with proximity sorting
- Search with filters
- Cart + Checkout with Razorpay
- Full rental lifecycle (reserve → pickup → return → inspect → close)
- Buy flow (cart → pay → pickup)
- Customer dashboard (orders, rentals, saved items, disputes, notifications, settings)
- Vendor dashboard (listings, bookings, rentals, earnings, payouts, calendar)
- Admin panel (vendor approvals, listing moderation, categories, disputes, users, transactions, commission settings)
- Reviews and ratings
- Notifications (in-app, email, SMS)
- Responsive web design
- SEO fundamentals

### Excluded from MVP (Future Phases)
| Feature | Why Deferred | Phase |
|---------|-------------|-------|
| In-app real-time chat | Requires WebSocket infrastructure; phone/WhatsApp reveal sufficient for MVP | Phase 2 |
| React Native mobile app | Web-first approach; responsive web covers mobile use cases | Phase 2 |
| Subscriptions | Complex billing logic, not validated demand yet | Phase 3 |
| Rent-to-Buy | Complex accounting, requires validated rental volume first | Phase 3 |
| AI Chatbot | Expensive (LLM costs), manual support sufficient for early scale | Phase 4 |
| Multi-currency | India-only at launch, INR sufficient | Phase 4 |
| Delivery/shipping | Adds logistics complexity; pickup is simpler and validates core model | Phase 3 |
| Automated KYC (Aadhaar API) | Manual review sufficient at small scale; automated KYC costs per verification | Phase 3 |
| Multi-language (Hindi) | English sufficient for initial tier-1 city launch | Phase 3 |
| Advanced analytics | Basic counts and charts sufficient for MVP; invest in analytics when data volume justifies it | Phase 3 |

---

## 8. Success Metrics

### Launch Targets (First 6 Months)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Vendor signups | 100 approved vendors | Admin dashboard count |
| Listings | 500 active listings | Catalog count |
| Completed transactions | 500 (rent + buy) | Order status = CLOSED |
| Monthly Active Users (MAU) | 2,000 | Unique logins per month |
| Dispute rate | < 5% of transactions | Disputes / Total orders |
| Average vendor rating | > 4.0 / 5.0 | Review aggregation |
| Customer repeat rate | > 25% | Users with 2+ orders |
| Platform revenue | ₹1,00,000+ | Commission earned |

### Key Performance Indicators (KPIs)

- **Supply**: Number of active listings per city, new vendor signups/week
- **Demand**: Searches/day, browse-to-cart conversion, cart-to-order conversion
- **Transactions**: Orders/week, average order value, rent vs buy ratio
- **Quality**: Average review rating, dispute resolution time, vendor response time
- **Retention**: Customer repeat rate, vendor retention (still active after 3 months)

---

## 9. Competitive Positioning

| Dimension | INNEED | OLX | Rentomojo | Local Shops |
|-----------|--------|-----|-----------|-------------|
| **Model** | P2P Rent + Buy | P2P Buy/Sell | B2C Subscription | B2C Rent |
| **Catalog** | User-generated (unlimited) | User-generated | Curated (limited) | Small, local |
| **Trust** | Verified vendors, reviews, disputes | Self-moderated | Company-owned | Word of mouth |
| **Payments** | Digital (UPI, cards) | Cash/external | Digital | Cash |
| **Rental Mgmt** | Full lifecycle | None | Full lifecycle | Manual |
| **Discovery** | Map + proximity | Location filter | Catalog browse | Walk-in |
| **Commission** | 10% (configurable) | Listing fees | Markup on cost | N/A |

---

## 10. Assumptions & Risks

### Assumptions
1. Urban Indians (tier-1 cities) are willing to rent physical goods from strangers if trust is established
2. UPI adoption makes digital payments frictionless for this audience
3. Vendors will list idle assets if the process is simple and they see earning potential
4. Pickup model is acceptable for the initial launch (no delivery needed)
5. Manual KYC (ID upload + admin review) is sufficient for trust at small scale

### Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Low vendor supply (cold start) | No items to rent → no customers | Seed supply in 2-3 cities; target specific niches (photography equipment, power tools) |
| Damage/theft of rented items | Vendor loss, trust erosion | Security deposits, damage protection, dispute system, vendor ID verification |
| Low customer trust | Users hesitant to rent from strangers | Verified vendor badges, reviews, transparent condition grading, damage protection |
| Razorpay security deposit complexity | Holds are tricky to implement | Use Razorpay's pre-authorization for deposits, clear refund policies |
| Vendor pricing too high | Customers choose to buy instead | Provide pricing guidance, show market comparisons, highlight savings vs buying |
| Dispute overload | Manual resolution doesn't scale | Clear policies, evidence-based process, escalation only for complex cases |

---

## 11. Glossary

| Term | Definition |
|------|-----------|
| **Vendor** | A user who has completed vendor onboarding and been approved to list items |
| **Customer** | Any user browsing, renting, or buying (all users are customers by default) |
| **Listing** | An item posted by a vendor, available for rent, buy, or both |
| **Rental** | A transaction where a customer rents an item for a specific duration |
| **Security Deposit** | A refundable amount held during a rental, set by the vendor per listing |
| **Platform Commission** | The percentage fee INNEED charges on each transaction (configurable by admin) |
| **Pickup Code** | A 6-digit code given to the customer to verify identity at pickup |
| **Vendor Onboarding** | The process of a customer becoming a vendor (business info, address, KYC) |
| **KYC** | Know Your Customer — identity verification via government ID upload |
| **Booking Request** | A customer's request to rent an item, pending vendor approval |
