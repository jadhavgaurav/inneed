import { PrismaClient } from '@prisma/client'

export class ReviewsService {
  constructor(private prisma: PrismaClient) {}

  async createReview(userId: string, data: {
    orderLineId: string
    listingId: string
    rating: number
    comment: string
  }) {
    // Check no duplicate review
    const existing = await this.prisma.review.findUnique({ where: { orderLineId: data.orderLineId } })
    if (existing) throw new Error('Review already submitted for this order')

    const review = await this.prisma.review.create({
      data: { userId, ...data },
    })

    // Update listing average rating
    const stats = await this.prisma.review.aggregate({
      where: { listingId: data.listingId, isVisible: true },
      _avg: { rating: true },
      _count: { rating: true },
    })

    await this.prisma.listingPricing.update({
      where: { listingId: data.listingId },
      data: {
        averageRating: stats._avg.rating || 0,
        totalReviews: stats._count.rating,
      },
    })

    return review
  }

  async getListingReviews(listingId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { listingId, isVisible: true },
        include: { user: { select: { id: true, name: true, avatar: true } } },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where: { listingId, isVisible: true } }),
    ])
    return { reviews, total, page, limit }
  }

  async getVendorReviews(vendorUserId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { listing: { vendorId: vendorUserId }, isVisible: true },
        include: {
          user: { select: { id: true, name: true } },
          listing: { select: { id: true, title: true } },
        },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.review.count({ where: { listing: { vendorId: vendorUserId }, isVisible: true } }),
    ])
    return { reviews, total, page, limit }
  }
}
