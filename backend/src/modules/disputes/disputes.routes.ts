import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import prisma from '../../lib/prisma'
import { DisputesService } from './disputes.service'
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware'

const disputeTypeValues = [
  'ITEM_NOT_AS_DESCRIBED', 'DAMAGED_ITEM', 'MISSING_PARTS',
  'LATE_RETURN', 'RETURN_DAMAGE', 'PAYMENT_ISSUE', 'OTHER',
] as const

export default async function disputesRoutes(app: FastifyInstance) {
  const svc = new DisputesService(prisma)

  // POST /disputes
  app.post('/', { preHandler: requireAuth }, async (req, reply) => {
    const body = z.object({
      orderId: z.string().uuid(),
      againstVendorId: z.string().uuid(),
      type: z.enum(disputeTypeValues),
      description: z.string().min(20).max(2000),
      imageUrls: z.array(z.string().url()).max(5).optional(),
    }).parse(req.body)
    return reply.code(201).send(await svc.createDispute(req.user!.userId, body))
  })

  // GET /disputes/:id
  app.get('/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    return reply.send(await svc.getDispute(id, req.user!.userId))
  })

  // POST /disputes/:id/evidence
  app.post('/:id/evidence', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = z.object({
      message: z.string().min(5).max(2000),
      imageUrls: z.array(z.string().url()).max(5).optional(),
    }).parse(req.body)
    return reply.code(201).send(await svc.addEvidence(id, req.user!.userId, body))
  })

  // GET /admin/disputes
  app.get('/admin/disputes', { preHandler: requireAdmin }, async (req, reply) => {
    const query = z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(20),
      status: z.string().optional(),
    }).parse(req.query)
    return reply.send(await svc.getAdminDisputes(query.page, query.limit, query.status))
  })

  // POST /admin/disputes/:id/resolve
  app.post('/admin/disputes/:id/resolve', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = z.object({
      resolution: z.string().min(10).max(2000),
      depositAdjustment: z.number().min(0).optional(),
    }).parse(req.body)
    return reply.send(await svc.resolveDispute(id, req.user!.userId, body))
  })
}
