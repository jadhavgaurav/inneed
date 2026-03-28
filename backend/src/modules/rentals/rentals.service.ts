import { PrismaClient } from '@prisma/client'

export class RentalsService {
  constructor(private prisma: PrismaClient) {}

  // ─── Vendor actions ───────────────────────────────────────────────────────

  async approveRental(rentalId: string, vendorUserId: string) {
    const rental = await this.prisma.rental.findFirstOrThrow({
      where: { id: rentalId, vendorId: vendorUserId, status: 'RESERVED' },
    })
    const updated = await this.prisma.rental.update({
      where: { id: rental.id },
      data: { status: 'READY_FOR_PICKUP' },
    })
    await this.prisma.rentalEvent.create({
      data: { rentalId: rental.id, type: 'READY_FOR_PICKUP', performedBy: vendorUserId },
    })
    return updated
  }

  async rejectRental(rentalId: string, vendorUserId: string, reason: string) {
    const rental = await this.prisma.rental.findFirstOrThrow({
      where: { id: rentalId, vendorId: vendorUserId, status: 'RESERVED' },
    })
    const updated = await this.prisma.rental.update({
      where: { id: rental.id },
      data: { status: 'CANCELLED' },
    })
    await this.prisma.rentalEvent.create({
      data: { rentalId: rental.id, type: 'CANCELLED', data: { reason }, performedBy: vendorUserId },
    })
    return updated
  }

  async confirmPickup(rentalId: string, vendorUserId: string, pickupCode: string) {
    const rental = await this.prisma.rental.findFirstOrThrow({
      where: { id: rentalId, vendorId: vendorUserId, status: 'READY_FOR_PICKUP' },
    })
    if (rental.pickupCode !== pickupCode) throw new Error('Invalid pickup code')

    const updated = await this.prisma.rental.update({
      where: { id: rental.id },
      data: { status: 'ACTIVE', pickedUpAt: new Date() },
    })
    await this.prisma.rentalEvent.create({
      data: { rentalId: rental.id, type: 'PICKED_UP', performedBy: vendorUserId },
    })
    return updated
  }

  async confirmReturn(rentalId: string, vendorUserId: string, condition: 'good' | 'damaged' | 'missing_parts', notes?: string) {
    const rental = await this.prisma.rental.findFirstOrThrow({
      where: { id: rentalId, vendorId: vendorUserId, status: { in: ['ACTIVE', 'DUE', 'OVERDUE'] } },
    })

    const updated = await this.prisma.rental.update({
      where: { id: rental.id },
      data: { status: condition === 'good' ? 'INSPECTED' : 'DISPUTED', returnedAt: new Date(), inspectedAt: new Date() },
    })

    await this.prisma.rentalEvent.create({
      data: { rentalId: rental.id, type: 'RETURNED', data: { condition, notes }, performedBy: vendorUserId },
    })

    if (condition === 'good') {
      // Release security deposit
      await this.prisma.securityDepositHold.updateMany({
        where: { rentalId: rental.id, status: 'HELD' },
        data: { status: 'RELEASED', processedAt: new Date() },
      })

      await this.prisma.rental.update({ where: { id: rental.id }, data: { status: 'CLOSED', closedAt: new Date() } })
    }

    return updated
  }

  // ─── Extension ────────────────────────────────────────────────────────────

  async requestExtension(rentalId: string, customerUserId: string, newEndDate: string) {
    const rental = await this.prisma.rental.findFirstOrThrow({
      where: { id: rentalId, customerId: customerUserId, status: { in: ['ACTIVE', 'DUE'] } },
    })
    await this.prisma.rentalEvent.create({
      data: {
        rentalId: rental.id,
        type: 'EXTENDED',
        data: { requestedEndDate: newEndDate, status: 'PENDING' },
        performedBy: customerUserId,
      },
    })
    return { message: 'Extension request sent to vendor' }
  }

  async approveExtension(rentalId: string, vendorUserId: string, newEndDate: string) {
    const rental = await this.prisma.rental.findFirstOrThrow({
      where: { id: rentalId, vendorId: vendorUserId },
    })
    const updated = await this.prisma.rental.update({
      where: { id: rental.id },
      data: { endDate: new Date(newEndDate), status: 'EXTENDED' },
    })
    return updated
  }

  // ─── Queries ──────────────────────────────────────────────────────────────

  async getVendorRentals(vendorUserId: string, page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit
    const where: any = { vendorId: vendorUserId }
    if (status) where.status = status

    const [rentals, total] = await Promise.all([
      this.prisma.rental.findMany({
        where,
        include: {
          listing: { select: { id: true, title: true } },
          customer: { select: { id: true, name: true, phone: true } },
        },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.rental.count({ where }),
    ])
    return { rentals, total, page, limit }
  }

  async getCustomerRentals(customerUserId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [rentals, total] = await Promise.all([
      this.prisma.rental.findMany({
        where: { customerId: customerUserId },
        include: {
          listing: { select: { id: true, title: true } },
          vendor: { select: { id: true, name: true } },
        },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.rental.count({ where: { customerId: customerUserId } }),
    ])
    return { rentals, total, page, limit }
  }

  async getVendorDashboard(vendorUserId: string) {
    const [pending, active, earnings, listingsCount] = await Promise.all([
      this.prisma.rental.count({ where: { vendorId: vendorUserId, status: 'RESERVED' } }),
      this.prisma.rental.count({ where: { vendorId: vendorUserId, status: { in: ['ACTIVE', 'DUE', 'OVERDUE'] } } }),
      this.prisma.ledgerEntry.aggregate({
        where: { vendorId: vendorUserId, type: 'EARNING' },
        _sum: { amount: true },
      }),
      this.prisma.listing.count({ where: { vendorId: vendorUserId } }),
    ])

    const recentRentals = await this.prisma.rental.findMany({
      where: { vendorId: vendorUserId },
      include: {
        listing: { select: { id: true, title: true } },
        customer: { select: { id: true, name: true } },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    })

    return {
      pendingApprovals: pending,
      activeRentals: active,
      totalEarnings: earnings._sum.amount || 0,
      listingsCount,
      recentRentals,
    }
  }

  async getVendorEarnings(vendorUserId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [entries, total] = await Promise.all([
      this.prisma.ledgerEntry.findMany({
        where: { vendorId: vendorUserId },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ledgerEntry.count({ where: { vendorId: vendorUserId } }),
    ])
    return { entries, total, page, limit }
  }
}
