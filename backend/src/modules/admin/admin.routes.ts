import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import prisma from '../../lib/prisma'
import { AdminService } from './admin.service'
import { requireAdmin } from '../../middleware/auth.middleware'

export default async function adminRoutes(app: FastifyInstance) {
  const svc = new AdminService(prisma)

  // GET /admin/vendors/pending
  app.get('/vendors/pending', { preHandler: requireAdmin }, async (req, reply) => {
    const query = z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
    }).parse(req.query)
    return reply.send(await svc.getPendingVendors(query.page, query.limit))
  })

  // POST /admin/vendors/:id/approve
  app.post('/vendors/:id/approve', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string }
    return reply.send(await svc.approveVendor(id, req.user!.userId))
  })

  // POST /admin/vendors/:id/reject
  app.post('/vendors/:id/reject', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = z.object({ reason: z.string().min(5) }).parse(req.body)
    return reply.send(await svc.rejectVendor(id, body.reason))
  })

  // GET /admin/analytics
  app.get('/analytics', { preHandler: requireAdmin }, async (_req, reply) => {
    return reply.send(await svc.getAnalytics())
  })

  // GET /admin/config
  app.get('/config', { preHandler: requireAdmin }, async (_req, reply) => {
    return reply.send(await svc.getConfig())
  })

  // PUT /admin/config/:key
  app.put('/config/:key', { preHandler: requireAdmin }, async (req, reply) => {
    const { key } = req.params as { key: string }
    const body = z.object({ value: z.string() }).parse(req.body)
    return reply.send(await svc.updateConfig(key, body.value, req.user!.userId))
  })
}
