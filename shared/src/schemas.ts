import { z } from 'zod'

// Auth schemas
export const otpRequestSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
})

export const otpVerifySchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/),
  otp: z.string().length(6),
})

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).max(50),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const googleAuthSchema = z.object({
  idToken: z.string().min(1),
})

// Vendor schemas
export const vendorOnboardingSchema = z.object({
  businessName: z.string().min(2).max(100),
  businessType: z.string().min(2).max(50),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  bio: z.string().max(500).optional(),
  address: z.string().min(5).max(200),
  city: z.string().min(2).max(50),
  state: z.string().min(2).max(50),
  pincode: z.string().regex(/^\d{6}$/),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})

// Listing schemas
export const createListingSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'HEAVY_USE']),
  availableForRent: z.boolean(),
  availableForSale: z.boolean(),
  quantity: z.number().int().min(1).max(100),
  features: z.array(z.string()).max(20).optional().default([]),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  rentPriceDaily: z.number().positive().optional(),
  rentPriceWeekly: z.number().positive().optional(),
  rentPriceMonthly: z.number().positive().optional(),
  buyPrice: z.number().positive().optional(),
  securityDeposit: z.number().min(0).default(0),
})

// Cart schemas
export const addToCartSchema = z.object({
  listingId: z.string().uuid(),
  mode: z.enum(['RENT', 'BUY']),
  quantity: z.number().int().min(1).default(1),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  damageProtection: z.boolean().default(false),
})

// Checkout schemas
export const checkoutSchema = z.object({
  pickupAddress: z.string().min(10).max(500).optional(),
  notes: z.string().max(500).optional(),
})

// Review schemas
export const createReviewSchema = z.object({
  orderLineId: z.string().uuid(),
  listingId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000),
})

// Dispute schemas
export const createDisputeSchema = z.object({
  orderId: z.string().uuid(),
  type: z.enum([
    'ITEM_NOT_AS_DESCRIBED',
    'DAMAGED_ITEM',
    'MISSING_PARTS',
    'LATE_RETURN',
    'RETURN_DAMAGE',
    'PAYMENT_ISSUE',
    'OTHER',
  ]),
  description: z.string().min(20).max(2000),
})

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const listingSearchSchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  priceMin: z.coerce.number().positive().optional(),
  priceMax: z.coerce.number().positive().optional(),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'HEAVY_USE']).optional(),
  mode: z.enum(['RENT', 'BUY']).optional(),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radius: z.coerce.number().positive().default(25),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})
