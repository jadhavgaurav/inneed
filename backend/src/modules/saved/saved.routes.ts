import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import prisma from '../../lib/prisma'
import { SavedService } from './saved.service'
import { requireAuth } from '../../middleware/auth.middleware'

export default async function savedRoutes(app: FastifyInstance) {
  const svc = new SavedService(prisma)

  // GET /saved
  app.get('/', { preHandler: requireAuth }, async (req, reply) => {
    const query = z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(20),
    }).parse(req.query)
    return reply.send(await svc.getSavedItems(req.user!.userId, query.page, query.limit))
  })

  // POST /saved/:listingId
  app.post('/:listingId', { preHandler: requireAuth }, async (req, reply) => {
    const { listingId } = req.params as { listingId: string }
    return reply.code(201).send(await svc.saveItem(req.user!.userId, listingId))
  })

  // DELETE /saved/:listingId
  app.delete('/:listingId', { preHandler: requireAuth }, async (req, reply) => {
    const { listingId } = req.params as { listingId: string }
    return reply.send(await svc.removeItem(req.user!.userId, listingId))
  })

  // GET /saved/:listingId/check
  app.get('/:listingId/check', { preHandler: requireAuth }, async (req, reply) => {
    const { listingId } = req.params as { listingId: string }
    return reply.send(await svc.isSaved(req.user!.userId, listingId))
  })
}
