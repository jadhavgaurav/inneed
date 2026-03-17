import { PrismaClient } from '@prisma/client'

export class AdminService {
  constructor(private prisma: PrismaClient) {}

  async getPendingVendors(page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [vendors, total] = await Promise.all([
      this.prisma.vendorProfile.findMany({
        where: { status: 'PENDING' },
        include: { user: { select: { id: true, name: true, email: true, phone: true } }, location: true, documents: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.vendorProfile.count({ where: { status: 'PENDING' } }),
    ])
    return { vendors, total, page, limit }
  }

  async approveVendor(vendorId: string, adminUserId: string) {
    const profile = await this.prisma.vendorProfile.update({
      where: { id: vendorId },
      data: { status: 'APPROVED', approvedAt: new Date(), approvedBy: adminUserId },
    })

    await this.prisma.user.update({
      where: { id: profile.userId },
      data: { isVendorApproved: true },
    })

    return profile
  }

  async rejectVendor(vendorId: string, reason: string) {
    return this.prisma.vendorProfile.update({
      where: { id: vendorId },
      data: { status: 'REJECTED', rejectionReason: reason },
    })
  }

  async getAnalytics() {
    const [totalUsers, totalListings, totalOrders, revenue] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.listing.count({ where: { status: 'ACTIVE' } }),
      this.prisma.order.count({ where: { status: { in: ['CONFIRMED', 'COMPLETED'] } } }),
      this.prisma.ledgerEntry.aggregate({
        where: { type: 'EARNING' },
        _sum: { amount: true },
      }),
    ])

    return {
      totalUsers,
      totalListings,
      totalOrders,
      totalRevenue: revenue._sum.amount || 0,
    }
  }

  async getConfig() {
    return this.prisma.platformConfig.findMany()
  }

  async updateConfig(key: string, value: string, adminUserId: string) {
    return this.prisma.platformConfig.upsert({
      where: { key },
      update: { value, updatedBy: adminUserId },
      create: { key, value, updatedBy: adminUserId },
    })
  }
}
