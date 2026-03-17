import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import prisma from '../../lib/prisma'
import { CartService } from './cart.service'
import { requireAuth } from '../../middleware/auth.middleware'

export default async function cartRoutes(app: FastifyInstance) {
  const svc = new CartService(prisma)

  // GET /cart
  app.get('/', { preHandler: requireAuth }, async (req, reply) => {
    return reply.send(await svc.getCart(req.user!.userId))
  })

  // POST /cart/items
  app.post('/items', { preHandler: requireAuth }, async (req, reply) => {
    const body = z.object({
      listingId: z.string().uuid(),
      mode: z.enum(['RENT', 'BUY']),
      quantity: z.number().int().min(1).default(1),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      damageProtection: z.boolean().default(false),
    }).parse(req.body)
    return reply.code(201).send(await svc.addItem(req.user!.userId, body))
  })

  // PUT /cart/items/:id
  app.put('/items/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = z.object({
      quantity: z.number().int().min(1).optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }).parse(req.body)
    return reply.send(await svc.updateItem(req.user!.userId, id, body))
  })

  // DELETE /cart/items/:id
  app.delete('/items/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    await svc.removeItem(req.user!.userId, id)
    return reply.code(204).send()
  })

  // DELETE /cart
  app.delete('/', { preHandler: requireAuth }, async (req, reply) => {
    await svc.clearCart(req.user!.userId)
    return reply.code(204).send()
  })
}
