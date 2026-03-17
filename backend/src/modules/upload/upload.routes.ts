import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { VendorService } from '../vendor/vendor.service'
import prisma from '../../lib/prisma'
import { requireAuth } from '../../middleware/auth.middleware'

export default async function uploadRoutes(app: FastifyInstance) {
  const vendorSvc = new VendorService(prisma)

  // POST /upload/presigned
  app.post('/presigned', { preHandler: requireAuth }, async (req, reply) => {
    const body = z.object({
      fileType: z.enum(['document', 'listing-image']),
      mimeType: z.string().regex(/^(image\/(jpeg|png|webp)|application\/pdf)$/),
    }).parse(req.body)

    const result = await vendorSvc.getPresignedUrl(req.user!.userId, body.fileType, body.mimeType)
    return reply.send(result)
  })
}
