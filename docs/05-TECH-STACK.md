# INNEED — Technology Stack

> **Version**: 1.0
> **Last Updated**: March 2026
> **Status**: Draft

---

## 1. Stack Overview

```
┌──────────────────────────────────────────────────────────┐
│                      FRONTEND                             │
│  Next.js 16 · React 18 · Tailwind CSS · Radix UI        │
│  TanStack Query · React Hook Form · Zod · Framer Motion  │
│  Google Maps · Razorpay Checkout.js                       │
├──────────────────────────────────────────────────────────┤
│                      BACKEND                              │
│  Fastify 5 · Prisma 5 · Zod · pg-boss                   │
│  Razorpay SDK · MSG91 API · Resend                       │
├──────────────────────────────────────────────────────────┤
│                   INFRASTRUCTURE                          │
│  PostgreSQL 16 (Neon) · Redis (Upstash) · R2 (Cloudflare)│
│  Vercel (FE) · Railway (BE) · Cloudflare CDN             │
├──────────────────────────────────────────────────────────┤
│                    TOOLING                                │
│  TypeScript 5 · ESLint · Prettier · Vitest · Playwright  │
│  Docker Compose · GitHub Actions · Sentry                │
└──────────────────────────────────────────────────────────┘
```

---

## 2. Technology Choices

### Frontend

| Technology | Version | Purpose | Why This Choice |
|-----------|---------|---------|-----------------|
| **Next.js** | 16 | React framework | App Router, SSR/SSG, API routes, Vercel-native. Latest version with performance improvements. |
| **React** | 18 | UI library | Stable release, wide ecosystem compatibility, concurrent features. |
| **TypeScript** | 5 | Type safety | Strict mode, catches bugs at compile time, better DX with autocomplete. |
| **Tailwind CSS** | 4 | Styling | Utility-first, no CSS file bloat, design system via CSS variables, fast iteration. |
| **Radix UI** | Latest | Headless components | Accessible, unstyled primitives. Combined with Shadcn/ui for styled components. |
| **Shadcn/ui** | Latest | Component library | Beautiful, copy-paste components built on Radix. Full control, no dependency lock-in. |
| **Lucide React** | Latest | Icons | Clean, consistent icon set. Tree-shakeable for small bundles. |
| **TanStack Query** | 5 | Server state | Caching, background refetch, stale-while-revalidate. Replaces manual useEffect + useState. |
| **React Hook Form** | 7 | Form management | Minimal re-renders, excellent performance, works with Zod for validation. |
| **Zod** | 3 | Schema validation | Shared between frontend forms and backend routes. TypeScript-first. |
| **Framer Motion** | 12 | Animations | Smooth page transitions, micro-interactions, gesture support. |
| **Recharts** | 2 | Charts | Simple, composable charts for dashboards. React-native. |
| **Axios** | 1 | HTTP client | Interceptors for auth, retry, error handling. Better than native fetch for complex needs. |
| **@react-google-maps/api** | Latest | Map integration | Google Maps React wrapper. Map view, markers, clustering. |
| **date-fns** | 3 | Date utilities | Lightweight, tree-shakeable. Better than Moment.js. |
| **Sonner** | 2 | Toast notifications | Beautiful, accessible toasts. Minimal setup. |
| **next-themes** | Latest | Theme management | Dark/light mode support with SSR. |
| **@react-oauth/google** | Latest | Google OAuth | Google Sign-In button and ID token handling. |

### Backend

| Technology | Version | Purpose | Why This Choice |
|-----------|---------|---------|-----------------|
| **Fastify** | 5 | HTTP framework | 2x faster than Express, built-in schema validation, TypeScript-first, plugin architecture. |
| **Prisma** | 5 | ORM | Type-safe database client, auto-generated types, migrations, Prisma Studio for debugging. |
| **Zod** | 3 | Request validation | Same library as frontend. Validate all inputs at the API boundary. |
| **pg-boss** | 10 | Job queue | PostgreSQL-backed, no extra infrastructure. Handles scheduled jobs, retries, dead letter queues. |
| **Razorpay SDK** | Latest | Payments | Official Node.js SDK. Orders, payments, refunds, webhooks, payouts. |
| **Pino** | 9 | Logging | Fastest Node.js logger. Structured JSON output. |
| **bcrypt** | 5 | Hashing | Industry-standard password and OTP hashing. |
| **jsonwebtoken** | 9 | JWT | Token generation and verification. |
| **@fastify/cors** | Latest | CORS | Cross-origin request handling. |
| **@fastify/helmet** | Latest | Security headers | OWASP security headers (CSP, HSTS, etc.). |
| **@fastify/rate-limit** | Latest | Rate limiting | Per-route rate limiting with Redis backend. |
| **@fastify/cookie** | Latest | Cookie handling | httpOnly cookie management for JWT tokens. |
| **@fastify/csrf-protection** | Latest | CSRF | Double-submit cookie CSRF protection. |
| **@fastify/swagger** | Latest | API docs | Auto-generated Swagger/OpenAPI documentation. |
| **ioredis** | 5 | Redis client | Full-featured Redis client. Used for caching, rate limiting, sessions. |
| **@aws-sdk/client-s3** | 3 | Object storage | S3-compatible client for Cloudflare R2 presigned URLs. |
| **nodemailer** or **Resend SDK** | Latest | Email | Transactional email delivery. Resend preferred for simplicity. |

### Infrastructure

| Service | Purpose | Why This Choice | Free Tier |
|---------|---------|-----------------|-----------|
| **Vercel** | Frontend hosting | Next.js native, auto-deploy, edge functions, analytics | 100GB bandwidth/mo |
| **Railway** | Backend hosting | Simple deploy from git, built-in monitoring, $5/mo start | $5 credit/mo |
| **Neon** | PostgreSQL | Serverless, auto-suspend (saves cost), branching for dev | 0.5GB storage |
| **Upstash** | Redis | Serverless, pay-per-request, global replication | 10K commands/day |
| **Cloudflare R2** | Object storage | S3-compatible, **zero egress fees** (huge for image-heavy marketplace) | 10GB storage |
| **Cloudflare CDN** | Image delivery | Automatic with R2, image transformations, global edge | Included with R2 |
| **Sentry** | Error tracking | Stack traces, breadcrumbs, performance monitoring | 5K events/mo |
| **GitHub Actions** | CI/CD | Integrated with repo, free for public repos | 2000 min/mo |

### Third-Party Services

| Service | Purpose | Why This Choice | Pricing |
|---------|---------|-----------------|---------|
| **Razorpay** | Payments | India standard. UPI, cards, net banking, wallets. Split payments for marketplace. | 2% per transaction |
| **MSG91** | SMS / OTP | Cheap India SMS (₹0.14/SMS). Built-in OTP service. WhatsApp API support. | Pay per SMS |
| **Google Maps** | Maps & geocoding | Industry standard. Map view, geocoding, places autocomplete, distance matrix. | $200 free credit/mo |
| **Google OAuth** | Social login | Largest social login provider. Easy integration. | Free |
| **Resend** | Transactional email | Modern email API. React email templates. Simple pricing. | 3K emails/mo free |

### Testing

| Technology | Purpose | Why This Choice |
|-----------|---------|-----------------|
| **Vitest** | Unit + integration tests | Fast, Vite-native, same API as Jest. Works for both frontend and backend. |
| **React Testing Library** | Component testing | Tests components as users interact with them. Best practice for React. |
| **Playwright** | E2E browser testing | Multi-browser, auto-wait, visual comparisons. Tests critical flows end-to-end. |
| **Supertest** | API endpoint testing | HTTP assertions for Fastify. Simulates API requests without starting server. |
| **MSW** | API mocking | Mock Service Worker for frontend tests. Intercepts network requests. |

### Development Tools

| Tool | Purpose |
|------|---------|
| **TypeScript 5** (strict mode) | Type safety across entire codebase |
| **ESLint** | Code quality rules |
| **Prettier** | Code formatting |
| **Docker Compose** | Local dev environment (PostgreSQL + Redis + MinIO) |
| **Prisma Studio** | Visual database browser |
| **Swagger UI** | Auto-generated API documentation (from Fastify schemas) |
| **Turborepo** (optional) | Monorepo build caching and task orchestration |

---

## 3. Frontend Dependencies

### `frontend/package.json`

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.7.0",
    "react-hook-form": "^7.55.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.23.0",
    "date-fns": "^3.6.0",
    "motion": "^12.0.0",
    "recharts": "^2.15.0",
    "sonner": "^2.0.0",
    "next-themes": "^0.4.0",
    "lucide-react": "^0.487.0",
    "@react-oauth/google": "^0.13.0",
    "@react-google-maps/api": "^2.20.0",
    "embla-carousel-react": "^8.6.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.5.0",
    "cmdk": "^1.0.0",
    "vaul": "^1.1.0",
    "input-otp": "^1.4.0",
    "react-day-picker": "^8.10.0",
    "@radix-ui/react-accordion": "latest",
    "@radix-ui/react-alert-dialog": "latest",
    "@radix-ui/react-avatar": "latest",
    "@radix-ui/react-checkbox": "latest",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-dropdown-menu": "latest",
    "@radix-ui/react-label": "latest",
    "@radix-ui/react-navigation-menu": "latest",
    "@radix-ui/react-popover": "latest",
    "@radix-ui/react-progress": "latest",
    "@radix-ui/react-radio-group": "latest",
    "@radix-ui/react-scroll-area": "latest",
    "@radix-ui/react-select": "latest",
    "@radix-ui/react-separator": "latest",
    "@radix-ui/react-slider": "latest",
    "@radix-ui/react-slot": "latest",
    "@radix-ui/react-switch": "latest",
    "@radix-ui/react-tabs": "latest",
    "@radix-ui/react-toast": "latest",
    "@radix-ui/react-tooltip": "latest"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^16.0.0",
    "prettier": "^3.0.0",
    "prettier-plugin-tailwindcss": "^0.6.0",
    "vitest": "^2.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "msw": "^2.4.0",
    "@playwright/test": "^1.48.0"
  }
}
```

---

## 4. Backend Dependencies

### `backend/package.json`

```json
{
  "dependencies": {
    "fastify": "^5.0.0",
    "@fastify/cors": "latest",
    "@fastify/helmet": "latest",
    "@fastify/cookie": "latest",
    "@fastify/rate-limit": "latest",
    "@fastify/csrf-protection": "latest",
    "@fastify/swagger": "latest",
    "@fastify/swagger-ui": "latest",
    "@fastify/multipart": "latest",
    "@prisma/client": "^5.0.0",
    "zod": "^3.23.0",
    "pg-boss": "^10.0.0",
    "ioredis": "^5.4.0",
    "razorpay": "^2.9.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "@aws-sdk/client-s3": "^3.600.0",
    "@aws-sdk/s3-request-presigner": "^3.600.0",
    "pino": "^9.0.0",
    "pino-pretty": "^11.0.0",
    "resend": "^4.0.0",
    "date-fns": "^3.6.0",
    "nanoid": "^5.0.0",
    "@sentry/node": "^8.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^22.0.0",
    "@types/bcrypt": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.0",
    "prisma": "^5.0.0",
    "vitest": "^2.0.0",
    "supertest": "^7.0.0",
    "@types/supertest": "^6.0.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0",
    "tsx": "^4.0.0",
    "dotenv": "^16.0.0"
  }
}
```

---

## 5. Shared Types Package

### `shared/package.json`

```json
{
  "name": "@inneed/shared",
  "version": "0.0.1",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "dependencies": {
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

Contains:
- Shared TypeScript interfaces (User, Listing, Order, etc.)
- Shared Zod schemas (reused in frontend forms and backend validation)
- Shared constants (enums, status values, config defaults)
- Shared utility types

---

## 6. Infrastructure Cost Estimate

### Launch Phase (0-1K users)

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| Vercel | Hobby (free) | ₹0 |
| Railway | Starter | ₹400 ($5) |
| Neon | Free tier (0.5GB) | ₹0 |
| Upstash Redis | Free tier | ₹0 |
| Cloudflare R2 | Free tier (10GB) | ₹0 |
| Razorpay | Pay per transaction | ~₹200 (2% of GMV) |
| MSG91 | Pay per SMS | ~₹500 (100 OTPs/day × ₹0.14) |
| Google Maps | Free credit ($200/mo) | ₹0 |
| Resend | Free tier (3K/mo) | ₹0 |
| Sentry | Free tier | ₹0 |
| Domain | .in domain | ₹800/year ≈ ₹67/mo |
| **TOTAL** | | **~₹1,200/mo ($15)** |

### Growth Phase (1K-10K users)

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| Vercel | Pro | ₹1,600 ($20) |
| Railway | Pro | ₹1,600 ($20) |
| Neon | Scale (10GB) | ₹1,500 ($19) |
| Upstash Redis | Pay-as-you-go | ₹400 ($5) |
| Cloudflare R2 | Pay-as-you-go (50GB) | ₹600 ($7.50) |
| Razorpay | 2% of GMV | ~₹5,000 |
| MSG91 | Bulk plan | ~₹2,000 |
| Google Maps | Usage-based | ~₹1,000 |
| Resend | Pro plan | ₹1,600 ($20) |
| Sentry | Team plan | ₹2,100 ($26) |
| **TOTAL** | | **~₹17,400/mo ($210)** |

### Scale Phase (10K+ users)

| Service | Plan | Monthly Cost |
|---------|------|-------------|
| Vercel | Pro + bandwidth | ₹4,000 ($50) |
| Railway | Pro + scaled | ₹8,000 ($100) |
| Neon | Scale (100GB) | ₹6,500 ($80) |
| Upstash Redis | Pro | ₹2,400 ($30) |
| Cloudflare R2 | 500GB | ₹3,000 ($37) |
| Razorpay | 2% of GMV | ~₹50,000 |
| MSG91 | Enterprise | ~₹10,000 |
| Google Maps | Usage-based | ~₹5,000 |
| Resend | Business | ₹4,000 ($50) |
| Sentry | Business | ₹6,500 ($80) |
| **TOTAL** | | **~₹1,00,000/mo ($1,200)** |

**Note**: At scale phase, the platform should be revenue-positive. At 2% Razorpay fees on ₹25,00,000 GMV with 10% commission = ₹2,50,000 revenue vs ~₹1,00,000 infrastructure cost.

---

## 7. Technology Decision Rationale

### Why Next.js 16 over alternatives?

| Alternative | Why Not |
|------------|---------|
| Remix | Smaller ecosystem, less hosting support, less SSG capability |
| Vite + React | No SSR out of the box, worse SEO, need separate meta framework |
| Nuxt (Vue) | Team knows React, smaller React Native code sharing |
| SvelteKit | Smaller ecosystem, less hiring pool, no React Native sharing |

### Why Fastify over Express?

| Aspect | Express | Fastify |
|--------|---------|---------|
| Performance | ~15K req/s | ~30K req/s |
| Schema validation | Manual (middleware) | Built-in (JSON Schema / Zod) |
| TypeScript | Retrofitted | First-class |
| Plugin system | Middleware stack | Encapsulated plugins |
| Auto-documentation | Manual (Swagger JSDoc) | Automatic (from schemas) |

### Why PostgreSQL over MongoDB?

| Aspect | PostgreSQL | MongoDB |
|--------|-----------|---------|
| Data model | Relational (orders, payments need ACID) | Document (flexible but less consistent) |
| Transactions | Full ACID | Multi-document transactions (slower) |
| Full-text search | Built-in (pg_trgm) | Built-in (Atlas Search) |
| Geospatial | PostGIS extension | Built-in (GeoJSON) |
| ORMs | Prisma (excellent) | Mongoose (good but less type-safe) |
| Marketplace fit | Better (relational data: users → orders → payments) | Worse (many cross-collection queries) |

### Why Cloudflare R2 over AWS S3?

| Aspect | AWS S3 | Cloudflare R2 |
|--------|--------|--------------|
| Storage cost | $0.023/GB | $0.015/GB |
| Egress cost | $0.09/GB | **$0.00/GB** (free!) |
| CDN | Extra (CloudFront) | Included |
| API | S3 API | S3-compatible (same SDK) |
| Image transforms | Extra (Lambda@Edge) | Included (Image Transformations) |

For an image-heavy marketplace, **R2 saves thousands** in egress fees.

### Why TanStack Query over SWR or raw fetch?

| Aspect | Raw useEffect | SWR | TanStack Query |
|--------|--------------|-----|----------------|
| Caching | Manual | Automatic | Automatic + configurable |
| Deduplication | None | Yes | Yes |
| Retry | Manual | Limited | Full control |
| Devtools | None | None | Excellent devtools |
| Mutations | Manual | Manual | Built-in with cache invalidation |
| Pagination | Manual | Basic | Infinite query support |
| TypeScript | Manual | Good | Excellent |

---

## 8. Mobile App Strategy (Phase 2)

### React Native with Expo

| Choice | Reason |
|--------|--------|
| **React Native** | Share knowledge with React web team (2-3 devs). Single language (TypeScript). |
| **Expo** | Managed workflow, OTA updates, push notifications, build service. Faster than bare RN. |
| **Shared types** | `@inneed/shared` package used by web and mobile. |
| **API client** | Same Axios-based client adapted for React Native. |

**What's shared:**
- TypeScript types and Zod schemas
- API client logic
- Business logic utilities (price calculation, date formatting)

**What's platform-specific:**
- UI components (React Native ≠ React DOM)
- Navigation (React Navigation vs Next.js Router)
- Storage (AsyncStorage vs cookies)
- Maps (react-native-maps vs @react-google-maps/api)

---

## 9. Security Best Practices

| Practice | Implementation |
|----------|---------------|
| Secrets management | Environment variables, never committed to git. `.env.local` in `.gitignore`. |
| Dependency scanning | `npm audit` in CI, Dependabot alerts on GitHub. |
| HTTPS everywhere | Vercel and Railway enforce HTTPS by default. |
| CSP headers | Restrictive Content-Security-Policy via Helmet. |
| SQL injection | Impossible with Prisma (parameterized queries). |
| XSS | React auto-escaping + CSP + no `dangerouslySetInnerHTML`. |
| CSRF | Double-submit cookie pattern via `@fastify/csrf-protection`. |
| Auth tokens | httpOnly, Secure, SameSite=Strict cookies. NEVER localStorage. |
| File uploads | Type whitelist, size limits, authenticated presigned URLs. |
| Rate limiting | Redis-backed per-route limits. |
