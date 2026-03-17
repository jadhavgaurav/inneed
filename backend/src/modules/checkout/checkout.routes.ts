import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import prisma from '../../lib/prisma'
import { CheckoutService } from './checkout.service'
import { requireAuth } from '../../middleware/auth.middleware'

export default async function checkoutRoutes(app: FastifyInstance) {
  const svc = new CheckoutService(prisma)

  // POST /checkout/quote
  app.post('/quote', { preHandler: requireAuth }, async (req, reply) => {
    return reply.send(await svc.getQuote(req.user!.userId))
  })

  // POST /checkout
  app.post('/', { preHandler: requireAuth }, async (req, reply) => {
    const body = z.object({
      pickupAddress: z.string().max(500).optional(),
      notes: z.string().max(500).optional(),
    }).parse(req.body)
    return reply.code(201).send(await svc.createOrder(req.user!.userId, body.pickupAddress, body.notes))
  })

  // POST /orders/:id/cancel
  app.post('/orders/:id/cancel', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    return reply.send(await svc.cancelOrder(id, req.user!.userId))
  })

  // GET /orders/:id
  app.get('/orders/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const order = await prisma.order.findFirstOrThrow({
      where: { id, userId: req.user!.userId },
      include: {
        lines: {
          include: {
            rental: true,
            listing: { select: { id: true, title: true } },
          },
        },
        payment: true,
      },
    })
    return reply.send(order)
  })

  // GET /orders — customer order history
  app.get('/orders', { preHandler: requireAuth }, async (req, reply) => {
    const query = z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(20),
    }).parse(req.query)
    const skip = (query.page - 1) * query.limit
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: req.user!.userId },
        include: { lines: { include: { listing: { select: { id: true, title: true } } } }, payment: { select: { status: true } } },
        skip, take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.count({ where: { userId: req.user!.userId } }),
    ])
    return reply.send({ orders, total, page: query.page, limit: query.limit })
  })
}
