import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import prisma from '../../lib/prisma'
import { RentalsService } from './rentals.service'
import { requireAuth } from '../../middleware/auth.middleware'

export default async function rentalsRoutes(app: FastifyInstance) {
  const svc = new RentalsService(prisma)

  // POST /rentals/:id/approve
  app.post('/:id/approve', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    return reply.send(await svc.approveRental(id, req.user!.userId))
  })

  // POST /rentals/:id/reject
  app.post('/:id/reject', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = z.object({ reason: z.string().min(5) }).parse(req.body)
    return reply.send(await svc.rejectRental(id, req.user!.userId, body.reason))
  })

  // POST /rentals/:id/pickup
  app.post('/:id/pickup', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = z.object({ pickupCode: z.string().length(6) }).parse(req.body)
    return reply.send(await svc.confirmPickup(id, req.user!.userId, body.pickupCode))
  })

  // POST /rentals/:id/return
  app.post('/:id/return', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = z.object({
      condition: z.enum(['good', 'damaged', 'missing_parts']),
      notes: z.string().optional(),
    }).parse(req.body)
    return reply.send(await svc.confirmReturn(id, req.user!.userId, body.condition, body.notes))
  })

  // POST /rentals/:id/extend
  app.post('/:id/extend', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = z.object({ newEndDate: z.string().datetime() }).parse(req.body)
    return reply.send(await svc.requestExtension(id, req.user!.userId, body.newEndDate))
  })

  // POST /rentals/:id/extend/approve
  app.post('/:id/extend/approve', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = z.object({ newEndDate: z.string().datetime() }).parse(req.body)
    return reply.send(await svc.approveExtension(id, req.user!.userId, body.newEndDate))
  })

  // GET /vendor/dashboard
  app.get('/vendor/dashboard', { preHandler: requireAuth }, async (req, reply) => {
    return reply.send(await svc.getVendorDashboard(req.user!.userId))
  })

  // GET /vendor/bookings
  app.get('/vendor/bookings', { preHandler: requireAuth }, async (req, reply) => {
    const query = z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(20),
      status: z.string().optional(),
    }).parse(req.query)
    return reply.send(await svc.getVendorRentals(req.user!.userId, query.page, query.limit, query.status))
  })

  // GET /vendor/earnings
  app.get('/vendor/earnings', { preHandler: requireAuth }, async (req, reply) => {
    const query = z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(20),
    }).parse(req.query)
    return reply.send(await svc.getVendorEarnings(req.user!.userId, query.page, query.limit))
  })

  // GET /customer/rentals
  app.get('/customer/rentals', { preHandler: requireAuth }, async (req, reply) => {
    const query = z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(20),
    }).parse(req.query)
    return reply.send(await svc.getCustomerRentals(req.user!.userId, query.page, query.limit))
  })
}
