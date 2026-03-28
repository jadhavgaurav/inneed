import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

function generateOrderNumber(): string {
  const date = new Date()
  const prefix = `IN${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`
  return `${prefix}${nanoid(8).toUpperCase()}`
}

function generatePickupCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export class CheckoutService {
  constructor(private prisma: PrismaClient) {}

  async getQuote(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { listing: { include: { pricing: true } } },
        },
      },
    })

    if (!cart || cart.items.length === 0) throw new Error('Cart is empty')

    const commissionRate = await this.getCommissionRate()
    let subtotal = 0
    let depositTotal = 0

    const lineItems = cart.items.map((item: any) => {
      const pricing = item.listing.pricing
      if (!pricing) throw new Error(`No pricing for listing ${item.listing.title}`)

      let unitPrice = 0
      let totalDays = 0

      if (item.mode === 'BUY') {
        unitPrice = pricing.buyPrice || 0
      } else {
        if (!item.startDate || !item.endDate) throw new Error('Rental dates required')
        totalDays = Math.ceil((item.endDate.getTime() - item.startDate.getTime()) / (1000 * 60 * 60 * 24))
        unitPrice = pricing.rentPriceDaily || 0
      }

      const itemTotal = unitPrice * (item.mode === 'BUY' ? item.quantity : totalDays)
      const deposit = item.mode === 'RENT' ? (pricing.securityDeposit || 0) * item.quantity : 0

      subtotal += itemTotal
      depositTotal += deposit

      return {
        listingId: item.listingId,
        vendorId: item.listing.vendorId,
        mode: item.mode,
        unitPrice,
        totalPrice: itemTotal,
        securityDeposit: deposit,
        startDate: item.startDate,
        endDate: item.endDate,
        totalDays: item.mode === 'RENT' ? totalDays : null,
        damageProtection: item.damageProtection,
      }
    })

    const commissionTotal = subtotal * commissionRate
    const total = subtotal + depositTotal + commissionTotal

    return { lineItems, subtotal, depositTotal, commissionTotal, commissionRate, total }
  }

  async createOrder(userId: string, pickupAddress?: string, notes?: string) {
    const quote = await this.getQuote(userId)

    const order = await this.prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        subtotal: quote.subtotal,
        depositTotal: quote.depositTotal,
        commissionTotal: quote.commissionTotal,
        commissionRate: quote.commissionRate,
        total: quote.total,
        pickupAddress,
        notes,
        lines: {
          create: quote.lineItems.map((line: any) => ({
            listingId: line.listingId,
            vendorId: line.vendorId,
            mode: line.mode,
            unitPrice: line.unitPrice,
            totalPrice: line.totalPrice,
            securityDeposit: line.securityDeposit,
            startDate: line.startDate,
            endDate: line.endDate,
            totalDays: line.totalDays,
            damageProtection: line.damageProtection,
          })),
        },
      },
      include: { lines: true },
    })

    // Clear cart after order creation
    await this.prisma.cart.update({
      where: { userId },
      data: { items: { deleteMany: {} } },
    })

    return order
  }

  async cancelOrder(orderId: string, userId: string) {
    const order = await this.prisma.order.findFirstOrThrow({
      where: { id: orderId, userId, status: 'PENDING_PAYMENT' },
    })
    return this.prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' },
    })
  }

  private async getCommissionRate(): Promise<number> {
    const config = await this.prisma.platformConfig.findUnique({
      where: { key: 'commission_rate_default' },
    })
    return config ? parseFloat(config.value) : 0.1
  }
}
