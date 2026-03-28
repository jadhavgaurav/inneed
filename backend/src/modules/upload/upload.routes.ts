import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { VendorService } from '../vendor/vendor.service'
import prisma from '../../lib/prisma'
import { requireAuth } from '../../middleware/auth.middleware'

export default async function uploadRoutes(app: FastifyInstance) {
  const vendorSvc = new VendorService(prisma)

  // POST /upload/signature
  // Returns Cloudinary signed upload params — frontend uploads directly to Cloudinary
  app.post('/signature', { preHandler: requireAuth }, async (req, reply) => {
    const body = z.object({
      fileType: z.enum(['document', 'listing-image']),
    }).parse(req.body)

    const result = await vendorSvc.getUploadSignature(req.user!.userId, body.fileType)
    return reply.send(result)
  })

  // Keep old /presigned route as alias for backward compatibility
  app.post('/presigned', { preHandler: requireAuth }, async (req, reply) => {
    const body = z.object({
      fileType: z.enum(['document', 'listing-image']),
    }).parse(req.body)

    const result = await vendorSvc.getUploadSignature(req.user!.userId, body.fileType)
    return reply.send(result)
  })
}
