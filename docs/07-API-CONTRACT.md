# INNEED — API Contract

> **Version**: 1.0
> **Last Updated**: March 2026
> **Status**: Draft
> **Base URL**: `/api/v1`

---

## 1. Conventions

### Base URL
```
Development: http://localhost:4001/api/v1
Production:  https://api.inneed.in/api/v1
```

### Authentication
All authenticated endpoints use **httpOnly cookies** (set automatically on login). No manual token management required on the client.

### Standard Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "pagination": {                    // Only for list endpoints
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "cursor": "eyJpZCI6Ij..."       // For cursor-based pagination
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "message": "Human-readable error message",
    "code": "VALIDATION_ERROR",
    "statusCode": 400,
    "details": [                     // Optional, for validation errors
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### Error Codes

| HTTP Status | Code | Description |
|------------|------|-------------|
| 400 | `VALIDATION_ERROR` | Request body/params failed validation |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication |
| 403 | `FORBIDDEN` | Authenticated but insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource already exists or state conflict |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |

### Pagination

**Cursor-based** (marketplace feeds, infinite scroll):
```
GET /listings?cursor=eyJpZCI6Ij...&limit=20
```

**Offset-based** (admin tables):
```
GET /admin/users?page=1&limit=25
```

### Common Headers

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | `application/json` |
| `X-Request-Id` | Auto | Unique request ID (added by server) |
| `X-Idempotency-Key` | Payment endpoints | Prevents duplicate operations |

---

## 2. Auth Endpoints

### `POST /auth/otp/request`
Request OTP via SMS.

```
Body:
{
  "phone": "+919876543210"       // E.164 format, required
}

Response (200):
{
  "success": true,
  "data": {
    "message": "OTP sent successfully",
    "expiresIn": 300              // seconds
  }
}

Errors:
  429 - Rate limit exceeded (max 5 per 15min)
  400 - Invalid phone format
```

### `POST /auth/otp/verify`
Verify OTP and login/register.

```
Body:
{
  "phone": "+919876543210",
  "otp": "123456"
}

Response (200):
  Sets httpOnly cookies: access_token, refresh_token
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "string",
      "email": "string | null",
      "phone": "string",
      "avatar": "string | null",
      "role": "CUSTOMER",
      "isVendorApproved": false,
      "isActive": true,
      "createdAt": "ISO date"
    },
    "isNewUser": true              // true if just registered
  }
}

Errors:
  401 - Invalid or expired OTP
  429 - Too many failed attempts
```

### `POST /auth/register`
Register with email + password.

```
Body:
{
  "name": "string",               // required, min 2
  "email": "user@example.com",    // required, valid email
  "password": "string",           // required, min 8, 1 upper, 1 lower, 1 number
  "phone": "+919876543210"        // optional
}

Response (201):
  Sets httpOnly cookies
{
  "success": true,
  "data": {
    "user": { ... },
    "isNewUser": true
  }
}

Errors:
  409 - Email already registered
  400 - Validation error
```

### `POST /auth/login`
Login with email + password.

```
Body:
{
  "email": "user@example.com",
  "password": "string"
}

Response (200):
  Sets httpOnly cookies
{
  "success": true,
  "data": { "user": { ... } }
}

Errors:
  401 - Invalid credentials
  429 - Rate limited
```

### `POST /auth/google`
Login/register with Google.

```
Body:
{
  "idToken": "Google ID token string"
}

Response (200):
  Sets httpOnly cookies
{
  "success": true,
  "data": {
    "user": { ... },
    "isNewUser": false
  }
}
```

### `POST /auth/forgot-password`
Request password reset OTP.

```
Body:
{
  "email": "user@example.com"
}

Response (200):
{
  "success": true,
  "data": { "message": "Reset OTP sent to email" }
}
```

### `POST /auth/reset-password`
Reset password with OTP.

```
Body:
{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "string"
}

Response (200):
{
  "success": true,
  "data": { "message": "Password reset successful" }
}
```

### `POST /auth/refresh`
Refresh access token.

```
No body required (refresh_token cookie sent automatically)

Response (200):
  Sets new httpOnly cookies (access + refresh)
{
  "success": true,
  "data": { "message": "Token refreshed" }
}

Errors:
  401 - Invalid or expired refresh token
```

### `POST /auth/logout`
Invalidate session.

```
Response (200):
  Clears cookies
{
  "success": true,
  "data": { "message": "Logged out" }
}
```

### `GET /auth/me`
Get current user profile. **Requires auth.**

```
Response (200):
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "name": "string",
      "email": "string | null",
      "phone": "string | null",
      "avatar": "string | null",
      "role": "CUSTOMER",
      "isVendorApproved": false,
      "isActive": true,
      "createdAt": "ISO date",
      "vendorProfile": null | {
        "id": "uuid",
        "businessName": "string",
        "status": "APPROVED"
      }
    }
  }
}
```

---

## 3. Catalog Endpoints

### `GET /categories`
List all active categories.

```
Query: (none)

Response (200):
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Power Tools",
        "slug": "power-tools",
        "description": "...",
        "icon": "drill",
        "parentId": null,
        "children": [
          { "id": "uuid", "name": "Drills", "slug": "drills", ... }
        ],
        "listingCount": 42
      }
    ]
  }
}
```

### `GET /categories/:slug`
Get category detail with metadata.

```
Response (200):
{
  "success": true,
  "data": {
    "category": { "id", "name", "slug", "description", "icon", "parentId", "listingCount" }
  }
}
```

### `GET /listings`
Search and browse listings.

```
Query Parameters:
  q             string    Search query (full-text)
  categoryId    uuid      Filter by category
  mode          string    "RENT" | "BUY" | "ALL" (default: ALL)
  minPrice      number    Minimum price (daily rent or buy)
  maxPrice      number    Maximum price
  condition     string[]  "NEW,LIKE_NEW,GOOD" (comma-separated)
  verified      boolean   Only verified vendors
  lat           number    Customer latitude (for proximity sort)
  lng           number    Customer longitude (for proximity sort)
  radius        number    Max distance in km (default: 50)
  city          string    Filter by city name
  sort          string    "proximity" | "price_asc" | "price_desc" | "rating" | "newest" (default: proximity)
  cursor        string    Pagination cursor
  limit         number    Items per page (default: 20, max: 50)

Response (200):
{
  "success": true,
  "data": {
    "listings": [
      {
        "id": "uuid",
        "title": "Bosch Power Drill",
        "description": "...",
        "condition": "LIKE_NEW",
        "availableForRent": true,
        "availableForSale": true,
        "isFeatured": false,
        "pricing": {
          "rentPriceDaily": 200,
          "rentPriceWeekly": 1200,
          "buyPrice": 5000,
          "securityDeposit": 500,
          "currency": "INR"
        },
        "images": [
          { "id": "uuid", "url": "https://cdn.inneed.in/...", "sortOrder": 0 }
        ],
        "vendor": {
          "id": "uuid",
          "businessName": "Rajesh Tools",
          "verified": true,
          "rating": 4.5,
          "responseTime": "Within 1 hour"
        },
        "location": {
          "city": "Mumbai",
          "state": "Maharashtra",
          "distance": 2.3            // km from customer (if lat/lng provided)
        },
        "rating": 4.2,
        "reviewCount": 15,
        "createdAt": "ISO date"
      }
    ]
  },
  "pagination": { "cursor": "...", "hasNext": true, "total": 150 }
}
```

### `GET /listings/:id`
Get listing detail.

```
Response (200):
{
  "success": true,
  "data": {
    "listing": {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "condition": "LIKE_NEW",
      "availableForRent": true,
      "availableForSale": true,
      "quantity": 2,
      "features": ["Cordless", "Variable speed", "LED light"],
      "pricing": {
        "rentPriceDaily": 200,
        "rentPriceWeekly": 1200,
        "rentPriceMonthly": 4000,
        "buyPrice": 5000,
        "securityDeposit": 500,
        "currency": "INR",
        "averageRating": 4.2,
        "totalReviews": 15
      },
      "images": [ { "id", "url", "sortOrder" } ],
      "vendor": {
        "id": "uuid",
        "businessName": "string",
        "avatar": "url | null",
        "verified": true,
        "rating": 4.5,
        "totalListings": 12,
        "responseTime": "Within 1 hour",
        "phone": null               // Shown only after booking
      },
      "location": {
        "city": "Mumbai",
        "state": "Maharashtra",
        "latitude": 19.076,
        "longitude": 72.877
      },
      "category": { "id", "name", "slug" },
      "createdAt": "ISO date"
    }
  }
}
```

### `GET /listings/:id/availability`
Check listing availability for dates.

```
Query:
  startDate   date    "2026-04-01"
  endDate     date    "2026-04-05"

Response (200):
{
  "success": true,
  "data": {
    "available": true,
    "availableQuantity": 1,
    "blockedDates": ["2026-04-10", "2026-04-11"],
    "pricing": {
      "dailyRate": 200,
      "totalDays": 4,
      "subtotal": 800,
      "securityDeposit": 500,
      "platformFee": 80,
      "total": 1380
    }
  }
}
```

### `GET /listings/:id/reviews`
Get reviews for a listing.

```
Query:
  page    number    default: 1
  limit   number    default: 10

Response (200):
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "uuid",
        "user": { "id", "name", "avatar" },
        "rating": 5,
        "comment": "Excellent tool, worked perfectly",
        "images": ["url1", "url2"],
        "helpfulCount": 3,
        "createdAt": "ISO date"
      }
    ],
    "summary": {
      "averageRating": 4.2,
      "totalReviews": 15,
      "distribution": { "5": 8, "4": 4, "3": 2, "2": 1, "1": 0 }
    }
  },
  "pagination": { ... }
}
```

### `GET /vendors/:id`
Get vendor public profile.

```
Response (200):
{
  "success": true,
  "data": {
    "vendor": {
      "id": "uuid",
      "businessName": "string",
      "bio": "string",
      "avatar": "url | null",
      "verified": true,
      "rating": 4.5,
      "totalReviews": 45,
      "totalListings": 12,
      "totalOrders": 150,
      "responseTime": "Within 1 hour",
      "location": { "city", "state" },
      "joinedDate": "ISO date"
    }
  }
}
```

### `GET /vendors/:id/listings`
Get a vendor's active listings.

```
Query:
  cursor   string
  limit    number    default: 20

Response (200):
{
  "success": true,
  "data": {
    "listings": [ ... ]           // Same format as GET /listings
  },
  "pagination": { ... }
}
```

---

## 4. Cart Endpoints

**All require authentication.**

### `GET /cart`
Get current user's cart.

```
Response (200):
{
  "success": true,
  "data": {
    "cart": {
      "id": "uuid",
      "items": [
        {
          "id": "uuid",
          "listing": { "id", "title", "images", "vendor", "pricing" },
          "mode": "RENT",
          "quantity": 1,
          "startDate": "2026-04-01",
          "endDate": "2026-04-05",
          "damageProtection": false,
          "lineTotal": 800
        }
      ],
      "subtotal": 800,
      "depositTotal": 500,
      "commissionTotal": 80,
      "total": 1380,
      "itemCount": 1
    }
  }
}
```

### `POST /cart`
Add item to cart.

```
Body:
{
  "listingId": "uuid",
  "mode": "RENT",                  // "RENT" | "BUY"
  "quantity": 1,
  "startDate": "2026-04-01",      // Required if mode=RENT
  "endDate": "2026-04-05",        // Required if mode=RENT
  "damageProtection": false        // Optional, only for RENT
}

Response (201):
{
  "success": true,
  "data": { "cart": { ... } }     // Updated full cart
}

Errors:
  404 - Listing not found
  409 - Item not available for selected dates
  400 - Invalid mode/dates
```

### `PATCH /cart/:itemId`
Update cart item.

```
Body:
{
  "quantity": 2,                   // Optional
  "startDate": "2026-04-02",      // Optional
  "endDate": "2026-04-06",        // Optional
  "damageProtection": true         // Optional
}

Response (200):
{
  "success": true,
  "data": { "cart": { ... } }
}
```

### `DELETE /cart/:itemId`
Remove item from cart.

```
Response (200):
{
  "success": true,
  "data": { "cart": { ... } }
}
```

### `DELETE /cart`
Clear entire cart.

```
Response (200):
{
  "success": true,
  "data": { "message": "Cart cleared" }
}
```

---

## 5. Checkout Endpoint

### `GET /checkout/quote`
Calculate checkout total from current cart. **Requires auth.**

```
Response (200):
{
  "success": true,
  "data": {
    "quote": {
      "items": [
        {
          "listingId": "uuid",
          "title": "string",
          "mode": "RENT",
          "quantity": 1,
          "unitPrice": 200,
          "days": 4,
          "lineTotal": 800,
          "securityDeposit": 500,
          "damageProtection": 0
        }
      ],
      "subtotal": 800,
      "depositTotal": 500,
      "commissionRate": 10,
      "commissionTotal": 80,
      "total": 1380,
      "currency": "INR"
    }
  }
}

Errors:
  409 - One or more items no longer available
```

---

## 6. Order Endpoints

**All require authentication.**

### `POST /orders`
Create order from current cart.

```
Body:
{
  "pickupNotes": "I'll come around 3 PM"    // Optional
}

Response (201):
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "orderNumber": "ORD-20260401-ABCD",
      "status": "PENDING_PAYMENT",
      "items": [ ... ],
      "subtotal": 800,
      "depositTotal": 500,
      "commissionTotal": 80,
      "total": 1380,
      "currency": "INR",
      "createdAt": "ISO date"
    }
  }
}

Errors:
  409 - Items no longer available (availability changed since quote)
  400 - Cart is empty
```

### `GET /orders`
List user's orders.

```
Query:
  status   string    "CONFIRMED" | "COMPLETED" | "CANCELLED" | "ALL" (default: ALL)
  page     number    default: 1
  limit    number    default: 10

Response (200):
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "uuid",
        "orderNumber": "string",
        "status": "CONFIRMED",
        "itemCount": 2,
        "total": 1380,
        "createdAt": "ISO date"
      }
    ]
  },
  "pagination": { ... }
}
```

### `GET /orders/:id`
Get order detail.

```
Response (200):
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "orderNumber": "string",
      "status": "CONFIRMED",
      "items": [
        {
          "id": "uuid",
          "listing": { "id", "title", "images" },
          "vendor": { "id", "businessName", "phone" },  // Phone shown after confirmation
          "mode": "RENT",
          "quantity": 1,
          "unitPrice": 200,
          "totalPrice": 800,
          "securityDeposit": 500,
          "startDate": "2026-04-01",
          "endDate": "2026-04-05",
          "rental": {
            "id": "uuid",
            "status": "RESERVED",
            "pickupCode": "A1B2C3"
          }
        }
      ],
      "subtotal": 800,
      "depositTotal": 500,
      "commissionTotal": 80,
      "total": 1380,
      "payment": {
        "id": "uuid",
        "status": "CAPTURED",
        "method": "UPI",
        "capturedAt": "ISO date"
      },
      "createdAt": "ISO date"
    }
  }
}
```

### `POST /orders/:id/cancel`
Cancel an order.

```
Body:
{
  "reason": "Changed my plans"     // Required
}

Response (200):
{
  "success": true,
  "data": {
    "order": { "id", "status": "CANCELLED" },
    "refund": { "id", "amount": 1380, "status": "INITIATED" }
  }
}

Errors:
  409 - Order cannot be cancelled (already picked up / completed)
```

---

## 7. Payment Endpoints

### `POST /payments/create-order`
Create Razorpay order for payment. **Requires auth.**

```
Body:
{
  "orderId": "uuid"
}
Headers:
  X-Idempotency-Key: "unique-key"

Response (200):
{
  "success": true,
  "data": {
    "razorpayOrderId": "order_ABCDEFGH",
    "amount": 138000,                // In paise (₹1380 = 138000 paise)
    "currency": "INR",
    "key": "rzp_live_XXXXXXXXX"      // Razorpay key ID for client
  }
}
```

### `POST /payments/verify`
Verify payment after Razorpay checkout. **Requires auth.**

```
Body:
{
  "razorpay_order_id": "order_ABCDEFGH",
  "razorpay_payment_id": "pay_XXXXXXXXX",
  "razorpay_signature": "hmac_signature_string"
}

Response (200):
{
  "success": true,
  "data": {
    "order": {
      "id": "uuid",
      "status": "CONFIRMED",
      "pickupCodes": ["A1B2C3"]     // For rental items
    },
    "payment": {
      "id": "uuid",
      "status": "CAPTURED"
    }
  }
}

Errors:
  400 - Invalid payment signature
  409 - Payment already processed
```

### `POST /payments/webhook`
Razorpay webhook handler (called by Razorpay, not client).

```
Headers:
  X-Razorpay-Signature: "webhook_signature"

Body: Razorpay webhook payload

Response (200):
{ "status": "ok" }

Note: Idempotent — safe to receive duplicate webhooks.
```

---

## 8. Rental Endpoints

**All require authentication.**

### `GET /rentals`
List user's rentals (customer view).

```
Query:
  status   string    "ACTIVE" | "DUE" | "OVERDUE" | "CLOSED" | "ALL"
  page     number
  limit    number

Response (200):
{
  "success": true,
  "data": {
    "rentals": [
      {
        "id": "uuid",
        "listing": { "id", "title", "images" },
        "vendor": { "id", "businessName" },
        "status": "ACTIVE",
        "startDate": "2026-04-01",
        "endDate": "2026-04-05",
        "daysRemaining": 3,
        "pickupCode": "A1B2C3",
        "createdAt": "ISO date"
      }
    ]
  },
  "pagination": { ... }
}
```

### `GET /rentals/:id`
Get rental detail.

```
Response (200):
{
  "success": true,
  "data": {
    "rental": {
      "id": "uuid",
      "listing": { ... },
      "vendor": { "id", "businessName", "phone" },
      "status": "ACTIVE",
      "startDate": "2026-04-01",
      "endDate": "2026-04-05",
      "daysRemaining": 3,
      "pickupCode": "A1B2C3",
      "pickedUpAt": "ISO date | null",
      "returnedAt": null,
      "deposit": {
        "amount": 500,
        "status": "HELD"
      },
      "events": [
        { "type": "RESERVED", "createdAt": "ISO date" },
        { "type": "PICKED_UP", "createdAt": "ISO date" }
      ],
      "canExtend": true,
      "canReturn": true
    }
  }
}
```

### `POST /rentals/:id/extend`
Request rental extension. **Requires auth (customer).**

```
Body:
{
  "newEndDate": "2026-04-08"
}

Response (200):
{
  "success": true,
  "data": {
    "extension": {
      "additionalDays": 3,
      "additionalCost": 600,
      "newEndDate": "2026-04-08",
      "status": "PENDING_VENDOR_APPROVAL"   // or "APPROVED" if auto-approved
    }
  }
}

Errors:
  409 - Listing not available for extended dates
  400 - Cannot extend (already overdue / returned)
```

### `POST /rentals/:id/return`
Initiate return process. **Requires auth (customer).**

```
Response (200):
{
  "success": true,
  "data": {
    "message": "Return initiated. Please bring the item to the vendor for inspection.",
    "rental": { "id", "status": "RETURNED" }
  }
}
```

---

## 9. Vendor Endpoints

**All require authentication + vendor approval.**

### `GET /vendor/profile`
### `PUT /vendor/profile`
Get or update vendor profile.

### `POST /vendor/onboarding`
Submit vendor onboarding.

```
Body:
{
  "businessName": "string",
  "businessType": "individual",
  "phone": "+919876543210",
  "bio": "string",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "pincode": "string"
  },
  "documents": [
    { "type": "AADHAAR", "fileKey": "uploads/vendor/doc_abc.pdf" }
  ]
}

Response (201):
{
  "success": true,
  "data": {
    "vendorProfile": { "id", "status": "PENDING" },
    "message": "Application submitted. You'll be notified within 24-48 hours."
  }
}
```

### `GET /vendor/dashboard`
Vendor dashboard stats.

```
Response (200):
{
  "success": true,
  "data": {
    "stats": {
      "activeListings": 5,
      "pendingBookings": 2,
      "activeRentals": 3,
      "totalEarnings": 45000,
      "availableBalance": 12000,
      "pendingPayout": 5000,
      "thisMonthEarnings": 8000,
      "thisMonthOrders": 12
    }
  }
}
```

### `POST /vendor/listings`
Create a new listing.

```
Body:
{
  "title": "Bosch Power Drill",
  "description": "Professional cordless drill...",
  "categoryId": "uuid",
  "condition": "LIKE_NEW",
  "availableForRent": true,
  "availableForSale": true,
  "rentPriceDaily": 200,
  "rentPriceWeekly": 1200,
  "rentPriceMonthly": 4000,
  "buyPrice": 5000,
  "securityDeposit": 500,
  "quantity": 1,
  "features": ["Cordless", "Variable speed"],
  "images": ["uploads/listing/img1.jpg", "uploads/listing/img2.jpg"]
}

Response (201):
{
  "success": true,
  "data": { "listing": { ... } }
}
```

### `PUT /vendor/listings/:id`
Update listing.

### `DELETE /vendor/listings/:id`
Archive listing (soft delete).

### `GET /vendor/bookings`
List booking requests.

```
Query:
  status   string    "PENDING" | "APPROVED" | "REJECTED" | "ALL"

Response (200):
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "uuid",
        "orderLine": {
          "listing": { "id", "title", "images" },
          "mode": "RENT",
          "startDate": "2026-04-01",
          "endDate": "2026-04-05",
          "totalPrice": 800,
          "securityDeposit": 500
        },
        "customer": { "id", "name", "avatar" },
        "status": "PENDING",
        "createdAt": "ISO date"
      }
    ]
  }
}
```

### `POST /vendor/bookings/:id/approve`
Approve a booking request.

### `POST /vendor/bookings/:id/reject`
Reject a booking request.

```
Body:
{
  "reason": "Item under maintenance"
}
```

### `GET /vendor/rentals`
List vendor's active rentals.

### `POST /vendor/rentals/:id/pickup`
Mark rental as picked up (verify pickup code).

```
Body:
{
  "pickupCode": "A1B2C3"
}

Response (200):
{
  "success": true,
  "data": {
    "rental": { "id", "status": "PICKED_UP" }
  }
}

Errors:
  400 - Invalid pickup code
```

### `POST /vendor/rentals/:id/return`
Process item return with inspection.

```
Body:
{
  "condition": "GOOD",              // "GOOD" | "MINOR_WEAR" | "DAMAGED" | "MISSING_PARTS"
  "notes": "Item returned in good condition",
  "damageImages": []                // R2 file keys if damaged
}

Response (200):
{
  "success": true,
  "data": {
    "rental": { "id", "status": "INSPECTED" },
    "deposit": {
      "status": "RELEASED",         // or "HELD" if damaged
      "releasedAmount": 500
    }
  }
}
```

### `GET /vendor/earnings`
Get earnings summary and transaction history.

```
Query:
  period   string    "week" | "month" | "year" | "all"
  page     number
  limit    number

Response (200):
{
  "success": true,
  "data": {
    "summary": {
      "totalEarnings": 45000,
      "availableBalance": 12000,
      "pendingPayout": 5000,
      "periodEarnings": 8000,
      "periodOrders": 12
    },
    "transactions": [
      {
        "id": "uuid",
        "type": "EARNING",
        "amount": 720,
        "description": "Rental: Bosch Power Drill (4 days)",
        "orderId": "uuid",
        "createdAt": "ISO date"
      }
    ]
  },
  "pagination": { ... }
}
```

### `GET /vendor/payouts`
List payout history.

### `PUT /vendor/payout-settings`
Update bank account for payouts.

```
Body:
{
  "accountHolderName": "Rajesh Kumar",
  "accountNumber": "1234567890",
  "ifscCode": "HDFC0001234",
  "bankName": "HDFC Bank"
}
```

---

## 10. Review Endpoints

### `POST /reviews`
Create a review. **Requires auth.** Only after completed order.

```
Body:
{
  "orderLineId": "uuid",
  "rating": 5,
  "comment": "Excellent condition, vendor was very helpful",
  "images": ["uploads/review/img1.jpg"]
}

Response (201):
{
  "success": true,
  "data": { "review": { ... } }
}

Errors:
  409 - Already reviewed this order line
  403 - Order not completed
```

### `GET /reviews/listing/:id`
See Section 3: `GET /listings/:id/reviews`

### `GET /reviews/vendor/:id`
Get all reviews for a vendor.

---

## 11. Dispute Endpoints

**All require authentication.**

### `POST /disputes`
File a dispute.

```
Body:
{
  "orderId": "uuid",
  "type": "DAMAGED_ITEM",
  "description": "The drill bit was broken when I received it",
  "images": ["uploads/dispute/evidence1.jpg"]
}

Response (201):
{
  "success": true,
  "data": {
    "dispute": {
      "id": "uuid",
      "disputeNumber": "DSP-20260405-XYZ",
      "status": "OPEN",
      "createdAt": "ISO date"
    }
  }
}
```

### `GET /disputes`
List user's disputes.

### `GET /disputes/:id`
Get dispute detail with evidence timeline.

### `POST /disputes/:id/evidence`
Add evidence/message to dispute.

```
Body:
{
  "message": "Here are additional photos of the damage",
  "images": ["uploads/dispute/evidence2.jpg"]
}
```

### `POST /disputes/:id/message`
Add a text message to dispute thread.

---

## 12. Notification Endpoints

**All require authentication.**

### `GET /notifications`
List user's notifications.

```
Query:
  unreadOnly   boolean   default: false
  page         number
  limit        number    default: 20

Response (200):
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "ORDER",
        "title": "Order Confirmed",
        "message": "Your order ORD-20260401-ABCD has been confirmed",
        "link": "/customer/orders/uuid",
        "isRead": false,
        "createdAt": "ISO date"
      }
    ],
    "unreadCount": 5
  },
  "pagination": { ... }
}
```

### `PATCH /notifications/:id/read`
Mark single notification as read.

### `POST /notifications/read-all`
Mark all notifications as read.

---

## 13. Upload Endpoints

### `POST /upload/presign`
Get a presigned URL for file upload. **Requires auth.**

```
Body:
{
  "fileName": "photo.jpg",
  "fileType": "image/jpeg",
  "context": "listing"              // "listing" | "vendor_doc" | "review" | "dispute" | "avatar"
}

Response (200):
{
  "success": true,
  "data": {
    "uploadUrl": "https://r2.inneed.in/...?X-Amz-Signature=...",
    "fileKey": "uploads/listing/abc123.jpg",
    "cdnUrl": "https://cdn.inneed.in/uploads/listing/abc123.jpg",
    "expiresIn": 300
  }
}

Errors:
  400 - Invalid file type or size
  403 - Upload context not allowed for user role
```

---

## 14. Admin Endpoints

**All require authentication + ADMIN role.**

### `GET /admin/dashboard`
Admin overview stats.

```
Response (200):
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 1500,
      "totalVendors": 120,
      "activeListings": 500,
      "ordersThisMonth": 200,
      "revenueThisMonth": 50000,
      "pendingVendorApprovals": 5,
      "openDisputes": 3,
      "disputeRate": 2.5
    }
  }
}
```

### `GET /admin/users`
List all users with filters.

```
Query:
  q        string    Search by name/email
  role     string    "CUSTOMER" | "ADMIN"
  vendor   boolean   Filter vendor-approved users
  status   string    "active" | "suspended"
  page     number
  limit    number
```

### `PATCH /admin/users/:id`
Update user (suspend/reinstate).

```
Body:
{
  "isActive": false,
  "reason": "Violation of terms"
}
```

### `GET /admin/vendors/pending`
List pending vendor applications.

### `POST /admin/vendors/:id/approve`
Approve vendor.

### `POST /admin/vendors/:id/reject`
Reject vendor.

```
Body:
{
  "reason": "Unclear ID document. Please re-upload."
}
```

### `GET /admin/listings/pending`
Listings needing moderation.

### `POST /admin/listings/:id/approve`
### `POST /admin/listings/:id/flag`
### `POST /admin/listings/:id/remove`

### `GET /admin/categories`
### `POST /admin/categories`
### `PUT /admin/categories/:id`
### `DELETE /admin/categories/:id`

### `GET /admin/disputes`
All disputes with filters.

### `POST /admin/disputes/:id/resolve`
Resolve a dispute.

```
Body:
{
  "resolution": "Full refund issued to customer. Deposit returned.",
  "action": "FULL_REFUND"           // "FULL_REFUND" | "PARTIAL_REFUND" | "DEPOSIT_ADJUST" | "DISMISS"
  "refundAmount": 800               // If partial refund
}
```

### `GET /admin/transactions`
All transactions with filters.

```
Query:
  status    string   "CAPTURED" | "FAILED" | "REFUNDED"
  startDate date
  endDate   date
  page      number
  limit     number
```

### `POST /admin/featured/:listingId`
Set listing as featured.

### `DELETE /admin/featured/:listingId`
Remove featured status.

### `GET /admin/settings/commission`
### `PUT /admin/settings/commission`
Get/update commission configuration.

```
PUT Body:
{
  "globalRate": 10,
  "categoryOverrides": [
    { "categoryId": "uuid", "rate": 8 },
    { "categoryId": "uuid", "rate": 12 }
  ]
}
```

---

## 15. Saved Items Endpoints

**Require authentication.**

### `GET /saved`
List user's saved items.

### `POST /saved`
Save an item.

```
Body: { "listingId": "uuid" }
```

### `DELETE /saved/:listingId`
Unsave an item.

---

## 16. Chat Endpoints (Phase 2)

*Documented for planning purposes. Implemented in Phase 2.*

### `GET /conversations`
List user's conversations.

### `GET /conversations/:id/messages`
Get messages in a conversation.

### `POST /conversations/:id/messages`
Send a message.

```
Body:
{
  "text": "Hi, is the drill available for pickup today?"
}
```

### WebSocket Events (Socket.io)
```
Client → Server:
  "join_conversation" { conversationId }
  "send_message" { conversationId, text }
  "typing" { conversationId }

Server → Client:
  "new_message" { message }
  "user_typing" { conversationId, userId }
  "message_read" { messageId }
```

---

## Endpoint Count Summary

| Group | Endpoints | Auth Required |
|-------|-----------|--------------|
| Auth | 9 | Partial |
| Catalog | 8 | No |
| Cart | 5 | Yes |
| Checkout | 1 | Yes |
| Orders | 4 | Yes |
| Payments | 3 | Yes (webhook: no) |
| Rentals | 4 | Yes |
| Vendor | 17 | Yes + Vendor |
| Reviews | 3 | Partial |
| Disputes | 5 | Yes |
| Notifications | 3 | Yes |
| Upload | 1 | Yes |
| Saved | 3 | Yes |
| Admin | 16 | Yes + Admin |
| **Total** | **82** | |
