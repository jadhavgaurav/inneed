import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import prisma from '../../lib/prisma'
import { PaymentsService } from './payments.service'
import { requireAuth } from '../../middleware/auth.middleware'

export default async function paymentsRoutes(app: FastifyInstance) {
  const svc = new PaymentsService(prisma)

  // POST /payments/create-order
  app.post('/create-order', { preHandler: requireAuth }, async (req, reply) => {
    const body = z.object({ orderId: z.string().uuid() }).parse(req.body)
    const idempotencyKey = (req.headers['x-idempotency-key'] as string) || `order-${body.orderId}`
    return reply.send(await svc.createRazorpayOrder(body.orderId, idempotencyKey))
  })

  // POST /payments/verify
  app.post('/verify', { preHandler: requireAuth }, async (req, reply) => {
    const body = z.object({
      razorpay_order_id: z.string(),
      razorpay_payment_id: z.string(),
      razorpay_signature: z.string(),
    }).parse(req.body)
    return reply.send(await svc.verifyPayment(
      body.razorpay_order_id,
      body.razorpay_payment_id,
      body.razorpay_signature
    ))
  })

  // POST /payments/webhook (called by Razorpay)
  app.post('/webhook', async (req, reply) => {
    const signature = req.headers['x-razorpay-signature'] as string
    return reply.send(await svc.handleWebhook(req.body, signature))
  })
}
