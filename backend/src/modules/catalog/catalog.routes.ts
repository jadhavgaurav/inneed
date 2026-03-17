import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import prisma from '../../lib/prisma'
import { CatalogService } from './catalog.service'
import { requireAuth, requireAdmin } from '../../middleware/auth.middleware'

export default async function catalogRoutes(app: FastifyInstance) {
  const svc = new CatalogService(prisma)

  // ─── Categories ───────────────────────────────────────────────────────────

  // GET /categories
  app.get('/categories', async (_req, reply) => {
    return reply.send(await svc.getCategories())
  })

  // POST /admin/categories
  app.post('/admin/categories', { preHandler: requireAdmin }, async (req, reply) => {
    const body = z.object({
      name: z.string().min(2).max(50),
      icon: z.string().optional(),
      description: z.string().optional(),
      parentId: z.string().uuid().optional(),
    }).parse(req.body)
    return reply.code(201).send(await svc.createCategory(body))
  })

  // PUT /admin/categories/:id
  app.put('/admin/categories/:id', { preHandler: requireAdmin }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = z.object({
      name: z.string().optional(),
      icon: z.string().optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
      sortOrder: z.number().int().optional(),
    }).parse(req.body)
    return reply.send(await svc.updateCategory(id, body))
  })

  // ─── Listings (public) ────────────────────────────────────────────────────

  // GET /listings — search + filters
  app.get('/listings', async (req, reply) => {
    const query = z.object({
      q: z.string().optional(),
      categoryId: z.string().uuid().optional(),
      priceMin: z.coerce.number().positive().optional(),
      priceMax: z.coerce.number().positive().optional(),
      condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'HEAVY_USE']).optional(),
      mode: z.enum(['RENT', 'BUY']).optional(),
      lat: z.coerce.number().optional(),
      lng: z.coerce.number().optional(),
      radius: z.coerce.number().positive().default(25),
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(20),
    }).parse(req.query)

    return reply.send(await svc.searchListings(query))
  })

  // GET /listings/:id
  app.get('/listings/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    return reply.send(await svc.getListingById(id))
  })

  // ─── Vendor Listings ──────────────────────────────────────────────────────

  // GET /vendor/listings
  app.get('/vendor/listings', { preHandler: requireAuth }, async (req, reply) => {
    const query = z.object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(50).default(20),
    }).parse(req.query)
    return reply.send(await svc.getVendorListings(req.user!.userId, query.page, query.limit))
  })

  // POST /vendor/listings
  app.post('/vendor/listings', { preHandler: requireAuth }, async (req, reply) => {
    const body = z.object({
      categoryId: z.string().uuid(),
      title: z.string().min(5).max(100),
      description: z.string().min(20).max(2000),
      condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'HEAVY_USE']),
      availableForRent: z.boolean().default(true),
      availableForSale: z.boolean().default(false),
      quantity: z.number().int().min(1).max(100).default(1),
      features: z.array(z.string()).default([]),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      rentPriceDaily: z.number().positive().optional(),
      rentPriceWeekly: z.number().positive().optional(),
      rentPriceMonthly: z.number().positive().optional(),
      buyPrice: z.number().positive().optional(),
      securityDeposit: z.number().min(0).default(0),
    }).parse(req.body)

    return reply.code(201).send(await svc.createListing(req.user!.userId, body))
  })

  // PUT /vendor/listings/:id
  app.put('/vendor/listings/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    return reply.send(await svc.updateListing(id, req.user!.userId, req.body))
  })

  // DELETE /vendor/listings/:id
  app.delete('/vendor/listings/:id', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    return reply.send(await svc.deleteListing(id, req.user!.userId))
  })

  // POST /vendor/listings/:id/images
  app.post('/vendor/listings/:id/images', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = z.object({
      images: z.array(z.object({ r2Key: z.string(), isPrimary: z.boolean().optional() })).max(10),
    }).parse(req.body)
    return reply.code(201).send(await svc.addListingImages(id, req.user!.userId, body.images))
  })
}
