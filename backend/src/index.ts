import { initSentry, Sentry } from './lib/sentry'
initSentry()

import Fastify from 'fastify'
import fastifyCookie from '@fastify/cookie'
import fastifyCors from '@fastify/cors'
import fastifyHelmet from '@fastify/helmet'
import fastifyRateLimit from '@fastify/rate-limit'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUI from '@fastify/swagger-ui'
import fastifyMultipart from '@fastify/multipart'
import { PrismaClient } from '@prisma/client'
import PgBoss from 'pg-boss'
import { validateEnv } from './lib/env'

// Modules
import authRoutes from './modules/auth/auth.routes'
import vendorRoutes from './modules/vendor/vendor.routes'
import adminRoutes from './modules/admin/admin.routes'
import catalogRoutes from './modules/catalog/catalog.routes'
import cartRoutes from './modules/cart/cart.routes'
import checkoutRoutes from './modules/checkout/checkout.routes'
import paymentsRoutes from './modules/payments/payments.routes'
import rentalsRoutes from './modules/rentals/rentals.routes'
import reviewsRoutes from './modules/reviews/reviews.routes'
import disputesRoutes from './modules/disputes/disputes.routes'
import notificationsRoutes from './modules/notifications/notifications.routes'
import savedRoutes from './modules/saved/saved.routes'
import uploadRoutes from './modules/upload/upload.routes'
import { setupJobs } from './jobs'

const env = validateEnv()
const prisma = new PrismaClient()

async function buildApp() {
  const app = Fastify({
    logger: {
      transport: env.NODE_ENV === 'development'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined,
    },
    bodyLimit: 1048576, // 1MB JSON body limit
  })

  // Global error handler — never leak stack traces
  app.setErrorHandler((err, request, reply) => {
    const error = err as Error & { statusCode?: number }
    const statusCode = error.statusCode || 500
    const message = statusCode < 500 ? error.message : 'Internal Server Error'

    if (statusCode >= 500) {
      request.log.error(error, 'Unhandled error')
      Sentry.captureException(error)
    }

    reply.status(statusCode).send({
      error: true,
      message,
      statusCode,
    })
  })

  // Plugins
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: false, // configured per-route
  })

  await app.register(fastifyCors, {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })

  await app.register(fastifyCookie, {
    secret: env.COOKIE_SECRET,
  })

  // Redis — optional for dev; fallback to in-memory rate limiting
  let redis: any = null
  try {
    const Redis = (await import('ioredis')).default
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      lazyConnect: true,
      retryStrategy: () => null,
      reconnectOnError: () => false,
    })
    await redis.connect()
    console.log('Redis connected')
  } catch (e) {
    console.warn('Redis not available — using in-memory rate limiting')
    redis = null
  }

  await app.register(fastifyRateLimit, {
    max: process.env.NODE_ENV === 'development' ? 1000 : 100,
    timeWindow: '1 minute',
    ...(redis ? { redis } : {}),
  })

  await app.register(fastifySwagger, {
    openapi: {
      info: { title: 'INNEED API', version: '1.0.0', description: 'P2P Rental Marketplace API' },
      components: {
        securitySchemes: {
          cookieAuth: { type: 'apiKey', in: 'cookie', name: 'access_token' },
        },
      },
    },
  })

  await app.register(fastifySwaggerUI, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: false },
  })

  await app.register(fastifyMultipart, {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  })

  // Decorate with shared instances
  app.decorate('prisma', prisma)
  app.decorate('redis', redis)

  // Health endpoint
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  }))

  // Routes
  await app.register(authRoutes, { prefix: '/auth' })
  await app.register(vendorRoutes, { prefix: '/vendor' })
  await app.register(adminRoutes, { prefix: '/admin' })
  await app.register(catalogRoutes, { prefix: '/' })
  await app.register(cartRoutes, { prefix: '/cart' })
  await app.register(checkoutRoutes, { prefix: '/checkout' })
  await app.register(paymentsRoutes, { prefix: '/payments' })
  await app.register(rentalsRoutes, { prefix: '/rentals' })
  await app.register(reviewsRoutes, { prefix: '/reviews' })
  await app.register(disputesRoutes, { prefix: '/disputes' })
  await app.register(notificationsRoutes, { prefix: '/notifications' })
  await app.register(savedRoutes, { prefix: '/saved' })
  await app.register(uploadRoutes, { prefix: '/upload' })

  return { app, redis }
}

async function main() {
  const { app, redis } = await buildApp()

  // Background jobs
  let boss: PgBoss | null = null
  try {
    boss = new PgBoss(process.env.DATABASE_URL!)
    await boss.start()
    await setupJobs(boss, prisma)
    console.log('pg-boss background jobs started')
  } catch (e) {
    console.warn('pg-boss failed to start (non-fatal):', (e as Error).message)
  }

  const port = parseInt(process.env.PORT || '3001')
  const host = process.env.HOST || '0.0.0.0'

  await app.listen({ port, host })
  console.log(`INNEED API running on http://${host}:${port}`)
  console.log(`Swagger docs at http://${host}:${port}/docs`)

  // Graceful shutdown
  const shutdown = async () => {
    await app.close()
    if (boss) await boss.stop()
    if (redis) await redis.quit()
    await prisma.$disconnect()
    process.exit(0)
  }

  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

export { buildApp }
