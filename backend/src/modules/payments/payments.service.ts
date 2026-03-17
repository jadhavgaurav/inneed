import { PrismaClient } from '@prisma/client'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { nanoid } from 'nanoid'

function generatePickupCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export class PaymentsService {
  private razorpay: Razorpay

  constructor(private prisma: PrismaClient) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    })
  }

  async createRazorpayOrder(orderId: string, idempotencyKey: string) {
    const order = await this.prisma.order.findUniqueOrThrow({
      where: { id: orderId, status: 'PENDING_PAYMENT' },
    })

    // Check if payment already exists for this idempotency key
    const existing = await this.prisma.payment.findUnique({ where: { idempotencyKey } })
    if (existing?.razorpayOrderId) {
      return { razorpayOrderId: existing.razorpayOrderId, amount: existing.amount, currency: 'INR' }
    }

    // Create Razorpay order (amount in paise)
    const rzpOrder = await this.razorpay.orders.create({
      amount: Math.round(order.total * 100),
      currency: 'INR',
      receipt: order.orderNumber,
      notes: { orderId: order.id },
    }) as any

    // Save payment record
    await this.prisma.payment.upsert({
      where: { orderId },
      update: { razorpayOrderId: rzpOrder.id },
      create: {
        orderId,
        razorpayOrderId: rzpOrder.id,
        amount: order.total,
        status: 'CREATED',
        idempotencyKey,
      },
    })

    return { razorpayOrderId: rzpOrder.id, amount: order.total, currency: 'INR' }
  }

  async verifyPayment(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ) {
    // Verify HMAC signature
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex')

    if (expected !== razorpaySignature) {
      throw new Error('Invalid payment signature')
    }

    const payment = await this.prisma.payment.findFirstOrThrow({
      where: { razorpayOrderId },
      include: { order: { include: { lines: true } } },
    })

    // Update payment
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { razorpayPaymentId, status: 'CAPTURED', capturedAt: new Date() },
    })

    // Confirm order
    await this.prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'CONFIRMED' },
    })

    // Create Rentals for rental order lines + SecurityDepositHold + LedgerEntry
    for (const line of payment.order.lines) {
      if (line.mode === 'RENT') {
        const rental = await this.prisma.rental.create({
          data: {
            orderLineId: line.id,
            customerId: payment.order.userId,
            vendorId: line.vendorId,
            listingId: line.listingId,
            startDate: line.startDate!,
            endDate: line.endDate!,
            pickupCode: generatePickupCode(),
          },
        })

        if (line.securityDeposit > 0) {
          await this.prisma.securityDepositHold.create({
            data: { rentalId: rental.id, amount: line.securityDeposit },
          })
        }
      }

      // Vendor LedgerEntry
      const earning = line.totalPrice
      const commission = earning * payment.order.commissionRate
      const lastEntry = await this.prisma.ledgerEntry.findFirst({
        where: { vendorId: line.vendorId },
        orderBy: { createdAt: 'desc' },
      })
      const balance = (lastEntry?.balance || 0) + earning - commission

      await this.prisma.ledgerEntry.create({
        data: {
          vendorId: line.vendorId,
          orderId: payment.orderId,
          type: 'EARNING',
          amount: earning - commission,
          balance,
          description: `Order ${payment.order.id} line`,
        },
      })
    }

    return { orderId: payment.orderId, status: 'CONFIRMED' }
  }

  async handleWebhook(payload: any, signature: string) {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
      .update(JSON.stringify(payload))
      .digest('hex')

    if (expectedSignature !== signature) {
      throw new Error('Invalid webhook signature')
    }

    const { event, payload: eventPayload } = payload

    if (event === 'payment.captured') {
      const payment = eventPayload.payment.entity
      await this.prisma.payment.updateMany({
        where: { razorpayPaymentId: payment.id },
        data: { status: 'CAPTURED', capturedAt: new Date() },
      })
    }

    if (event === 'payment.failed') {
      const payment = eventPayload.payment.entity
      await this.prisma.payment.updateMany({
        where: { razorpayOrderId: payment.order_id },
        data: { status: 'FAILED', failureReason: payment.error_description },
      })
    }

    return { received: true }
  }
}
