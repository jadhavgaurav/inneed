// Core TypeScript interfaces for INNEED

export type UserRole = 'CUSTOMER' | 'ADMIN'
export type VendorStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
export type ListingStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'FLAGGED'
export type ItemCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'HEAVY_USE'
export type OrderMode = 'RENT' | 'BUY'
export type OrderStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
export type PaymentStatus = 'CREATED' | 'AUTHORIZED' | 'CAPTURED' | 'FAILED' | 'REFUNDED'
export type RentalStatus =
  | 'RESERVED'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'ACTIVE'
  | 'DUE'
  | 'OVERDUE'
  | 'RETURNED'
  | 'INSPECTED'
  | 'CLOSED'
  | 'EXTENDED'
  | 'DISPUTED'
  | 'CANCELLED'
export type DepositStatus = 'HELD' | 'RELEASED' | 'PARTIALLY_RELEASED' | 'FORFEITED'
export type DisputeType =
  | 'ITEM_NOT_AS_DESCRIBED'
  | 'DAMAGED_ITEM'
  | 'MISSING_PARTS'
  | 'LATE_RETURN'
  | 'RETURN_DAMAGE'
  | 'PAYMENT_ISSUE'
  | 'OTHER'
export type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED'
export type NotificationType = 'ORDER' | 'BOOKING' | 'RENTAL' | 'PAYMENT' | 'REVIEW' | 'DISPUTE' | 'SYSTEM'
export type LedgerType = 'EARNING' | 'COMMISSION' | 'PAYOUT' | 'REFUND_DEDUCTION' | 'DEPOSIT_FORFEITURE'
export type DocType = 'AADHAAR' | 'PAN' | 'PASSPORT' | 'DRIVING_LICENSE' | 'OTHER'

export interface User {
  id: string
  email: string | null
  phone: string | null
  name: string
  avatar: string | null
  role: UserRole
  isVendorApproved: boolean
  googleId: string | null
  isActive: boolean
  createdAt: Date
}

export interface VendorProfile {
  id: string
  userId: string
  businessName: string
  businessType: string
  phone: string
  bio: string | null
  status: VendorStatus
  rejectionReason: string | null
  approvedAt: Date | null
  createdAt: Date
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  description: string | null
  parentId: string | null
  isActive: boolean
  sortOrder: number
}

export interface Listing {
  id: string
  vendorId: string
  categoryId: string
  title: string
  description: string
  condition: ItemCondition
  availableForRent: boolean
  availableForSale: boolean
  quantity: number
  features: string[]
  status: ListingStatus
  isFeatured: boolean
  latitude: number | null
  longitude: number | null
  createdAt: Date
  updatedAt: Date
}

export interface ListingPricing {
  listingId: string
  currency: string
  rentPriceDaily: number | null
  rentPriceWeekly: number | null
  rentPriceMonthly: number | null
  buyPrice: number | null
  securityDeposit: number
  averageRating: number
  totalReviews: number
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  status: OrderStatus
  subtotal: number
  depositTotal: number
  commissionTotal: number
  commissionRate: number
  total: number
  pickupAddress: string | null
  notes: string | null
  createdAt: Date
}

export interface Rental {
  id: string
  orderLineId: string
  customerId: string
  vendorId: string
  listingId: string
  status: RentalStatus
  startDate: Date
  endDate: Date
  pickupCode: string
  pickedUpAt: Date | null
  returnedAt: Date | null
  createdAt: Date
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: Date
}
