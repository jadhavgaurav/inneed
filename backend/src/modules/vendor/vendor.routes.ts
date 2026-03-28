import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import prisma from '../../lib/prisma'
import { VendorService } from './vendor.service'
import { requireAuth } from '../../middleware/auth.middleware'

export default async function vendorRoutes(app: FastifyInstance) {
  const svc = new VendorService(prisma)

  // POST /vendor/onboarding
  app.post('/onboarding', { preHandler: requireAuth }, async (req, reply) => {
    const body = z.object({
      businessName: z.string().min(2).max(100),
      businessType: z.string().min(2).max(50),
      phone: z.string().regex(/^[6-9]\d{9}$/),
      bio: z.string().max(500).optional(),
      address: z.string().min(5).max(200),
      city: z.string().min(2).max(50),
      state: z.string().min(2).max(50),
      pincode: z.string().regex(/^\d{6}$/),
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }).parse(req.body)

    const profile = await svc.onboard(req.user!.userId, body)
    return reply.code(201).send(profile)
  })

  // POST /vendor/presigned-url
  app.post('/presigned-url', { preHandler: requireAuth }, async (req, reply) => {
    const body = z.object({
      fileType: z.enum(['document', 'listing-image']),
      mimeType: z.string(),
    }).parse(req.body)

    const result = await svc.getUploadSignature(req.user!.userId, body.fileType)
    return reply.send(result)
  })

  // POST /vendor/documents
  app.post('/documents', { preHandler: requireAuth }, async (req, reply) => {
    const body = z.object({
      vendorId: z.string().uuid(),
      docType: z.enum(['AADHAAR', 'PAN', 'PASSPORT', 'DRIVING_LICENSE', 'OTHER']),
      r2Key: z.string(),
      fileName: z.string(),
    }).parse(req.body)

    const doc = await svc.saveDocument(body.vendorId, body.docType, body.r2Key, body.fileName)
    return reply.code(201).send(doc)
  })

  // GET /vendor/profile
  app.get('/profile', { preHandler: requireAuth }, async (req, reply) => {
    const profile = await svc.getProfile(req.user!.userId)
    return reply.send(profile)
  })
}
