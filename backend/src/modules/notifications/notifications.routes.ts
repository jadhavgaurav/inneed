import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import prisma from '../../lib/prisma'
import { NotificationsService } from './notifications.service'
import { requireAuth } from '../../middleware/auth.middleware'

export default async function notificationsRoutes(app: FastifyInstance) {
  const svc = new NotificationsService(prisma)

  // GET /notifications
  app.get('/', { preHandler: requireAuth }, async (req, reply) => {
    const query = z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(20),
    }).parse(req.query)
    return reply.send(await svc.getNotifications(req.user!.userId, query.page, query.limit))
  })

  // GET /notifications/unread-count
  app.get('/unread-count', { preHandler: requireAuth }, async (req, reply) => {
    return reply.send(await svc.unreadCount(req.user!.userId))
  })

  // POST /notifications/read
  app.post('/read', { preHandler: requireAuth }, async (req, reply) => {
    const body = z.object({
      ids: z.array(z.string().uuid()).optional(),
    }).parse(req.body)
    return reply.send(await svc.markAsRead(req.user!.userId, body.ids))
  })
}
