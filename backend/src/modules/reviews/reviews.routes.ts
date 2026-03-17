import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import prisma from '../../lib/prisma'
import { ReviewsService } from './reviews.service'
import { requireAuth } from '../../middleware/auth.middleware'

export default async function reviewsRoutes(app: FastifyInstance) {
  const svc = new ReviewsService(prisma)

  // POST /reviews
  app.post('/', { preHandler: requireAuth }, async (req, reply) => {
    const body = z.object({
      orderLineId: z.string().uuid(),
      listingId: z.string().uuid(),
      rating: z.number().int().min(1).max(5),
      comment: z.string().min(10).max(1000),
    }).parse(req.body)
    return reply.code(201).send(await svc.createReview(req.user!.userId, body))
  })

  // GET /listings/:id/reviews
  app.get('/listings/:id/reviews', async (req, reply) => {
    const { id } = req.params as { id: string }
    const query = z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(20),
    }).parse(req.query)
    return reply.send(await svc.getListingReviews(id, query.page, query.limit))
  })

  // GET /vendor/reviews
  app.get('/vendor/reviews', { preHandler: requireAuth }, async (req, reply) => {
    const query = z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(20),
    }).parse(req.query)
    return reply.send(await svc.getVendorReviews(req.user!.userId, query.page, query.limit))
  })
}
