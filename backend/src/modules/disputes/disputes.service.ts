import { PrismaClient, Prisma } from '@prisma/client'
import { sanitizeText } from '../../lib/sanitize'

type DisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED'
type DisputeType = 'ITEM_NOT_AS_DESCRIBED' | 'DAMAGED_ITEM' | 'MISSING_PARTS' | 'LATE_RETURN' | 'RETURN_DAMAGE' | 'PAYMENT_ISSUE' | 'OTHER'

function generateDisputeNumber() {
  return `DSP-${Date.now().toString(36).toUpperCase()}`
}

export class DisputesService {
  constructor(private prisma: PrismaClient) {}

  async createDispute(userId: string, data: {
    orderId: string
    againstVendorId: string
    type: DisputeType
    description: string
    imageUrls?: string[]
  }) {
    const order = await this.prisma.order.findUnique({ where: { id: data.orderId } })
    if (!order) throw Object.assign(new Error('Order not found'), { statusCode: 404 })
    if (order.userId !== userId) {
      throw Object.assign(new Error('Not authorized'), { statusCode: 403 })
    }

    return this.prisma.$transaction(async (tx: any) => {
      const dispute = await tx.dispute.create({
        data: {
          disputeNumber: generateDisputeNumber(),
          orderId: data.orderId,
          filedBy: userId,
          againstVendorId: data.againstVendorId,
          type: data.type,
          description: sanitizeText(data.description),
          status: 'OPEN',
        },
      })

      await tx.disputeEvidence.create({
        data: {
          disputeId: dispute.id,
          userId,
          message: data.description,
          images: data.imageUrls ?? [],
        },
      })

      return tx.dispute.findUnique({
        where: { id: dispute.id },
        include: {
          evidence: { orderBy: { createdAt: 'asc' } },
          filer: { select: { id: true, name: true } },
        },
      })
    })
  }

  async getDispute(id: string, userId: string, isAdmin = false) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: {
        order: { select: { id: true, orderNumber: true, userId: true } },
        filer: { select: { id: true, name: true, email: true } },
        evidence: { orderBy: { createdAt: 'asc' } },
      },
    })
    if (!dispute) throw Object.assign(new Error('Dispute not found'), { statusCode: 404 })

    if (!isAdmin && dispute.filedBy !== userId && dispute.againstVendorId !== userId && dispute.order.userId !== userId) {
      throw Object.assign(new Error('Not authorized'), { statusCode: 403 })
    }

    return dispute
  }

  async addEvidence(disputeId: string, userId: string, data: {
    message: string
    imageUrls?: string[]
  }) {
    const dispute = await this.prisma.dispute.findUnique({ where: { id: disputeId } })
    if (!dispute) throw Object.assign(new Error('Dispute not found'), { statusCode: 404 })
    if (dispute.status === 'RESOLVED' || dispute.status === 'CLOSED') {
      throw Object.assign(new Error('Dispute is already closed'), { statusCode: 400 })
    }
    if (dispute.filedBy !== userId && dispute.againstVendorId !== userId) {
      throw Object.assign(new Error('Not authorized'), { statusCode: 403 })
    }

    return this.prisma.disputeEvidence.create({
      data: { disputeId, userId, message: sanitizeText(data.message), images: data.imageUrls ?? [] },
    })
  }

  async getVendorDisputes(vendorUserId: string, page: number, limit: number) {
    const where = { againstVendorId: vendorUserId }
    const [disputes, total] = await Promise.all([
      this.prisma.dispute.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: { select: { id: true, orderNumber: true } },
          filer: { select: { id: true, name: true, email: true } },
          evidence: { orderBy: { createdAt: 'asc' } },
        },
      }),
      this.prisma.dispute.count({ where }),
    ])
    return { disputes, total, page, limit, pages: Math.ceil(total / limit) }
  }

  async getAdminDisputes(page: number, limit: number, status?: string) {
    const where = status ? { status: status as DisputeStatus } : {}
    const [disputes, total] = await Promise.all([
      this.prisma.dispute.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          order: { select: { id: true, orderNumber: true } },
          filer: { select: { id: true, name: true, email: true } },
          _count: { select: { evidence: true } },
        },
      }),
      this.prisma.dispute.count({ where }),
    ])
    return { disputes, total, page, limit, pages: Math.ceil(total / limit) }
  }

  async resolveDispute(id: string, adminUserId: string, data: {
    resolution: string
    depositAdjustment?: number
  }) {
    const dispute = await this.prisma.dispute.findUnique({ where: { id } })
    if (!dispute) throw Object.assign(new Error('Dispute not found'), { statusCode: 404 })
    if (dispute.status === 'RESOLVED' || dispute.status === 'CLOSED') {
      throw Object.assign(new Error('Dispute already resolved'), { statusCode: 400 })
    }

    return this.prisma.$transaction(async (tx: any) => {
      const updated = await tx.dispute.update({
        where: { id },
        data: {
          status: 'RESOLVED',
          resolution: sanitizeText(data.resolution),
          resolvedBy: adminUserId,
          resolvedAt: new Date(),
        },
      })

      if (data.depositAdjustment != null) {
        const rentals = await tx.rental.findMany({ where: { orderLine: { orderId: dispute.orderId } } })
        for (const rental of rentals) {
          const hold = await tx.securityDepositHold.findUnique({ where: { rentalId: rental.id } })
          if (hold && hold.status === 'HELD') {
            const deducted = Math.min(data.depositAdjustment, hold.amount)
            const released = hold.amount - deducted
            await tx.securityDepositHold.update({
              where: { id: hold.id },
              data: {
                status: deducted > 0 ? 'PARTIALLY_RELEASED' : 'RELEASED',
                releasedAmount: released,
                deductedAmount: deducted,
                deductionReason: data.resolution,
                processedAt: new Date(),
              },
            })
          }
        }
      }

      return updated
    })
  }
}
