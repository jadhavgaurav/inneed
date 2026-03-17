import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import prisma from '../../lib/prisma'
import { AuthService } from './auth.service'
import { requireAuth } from '../../middleware/auth.middleware'

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
}

export default async function authRoutes(app: FastifyInstance) {
  const svc = new AuthService(prisma)

  // POST /auth/otp/request
  app.post('/otp/request', {
    config: { rateLimit: { max: 5, timeWindow: '15 minutes' } },
  }, async (req, reply) => {
    const body = z.object({ phone: z.string().regex(/^[6-9]\d{9}$/) }).parse(req.body)
    const result = await svc.requestOtp(body.phone)
    return reply.send(result)
  })

  // POST /auth/otp/verify
  app.post('/otp/verify', async (req, reply) => {
    const body = z.object({ phone: z.string(), otp: z.string().length(6) }).parse(req.body)
    const { accessToken, refreshToken } = await svc.verifyOtp(body.phone, body.otp)
    reply
      .setCookie('access_token', accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 })
      .setCookie('refresh_token', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 })
      .send({ success: true })
  })

  // POST /auth/register
  app.post('/register', async (req, reply) => {
    const body = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(2).max(50),
    }).parse(req.body)
    const { accessToken, refreshToken } = await svc.register(body.email, body.password, body.name)
    reply
      .setCookie('access_token', accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 })
      .setCookie('refresh_token', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 })
      .send({ success: true })
  })

  // POST /auth/login
  app.post('/login', async (req, reply) => {
    const body = z.object({ email: z.string().email(), password: z.string() }).parse(req.body)
    const { accessToken, refreshToken } = await svc.login(body.email, body.password)
    reply
      .setCookie('access_token', accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 })
      .setCookie('refresh_token', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 })
      .send({ success: true })
  })

  // POST /auth/google
  app.post('/google', async (req, reply) => {
    const body = z.object({
      googleId: z.string(),
      email: z.string().email(),
      name: z.string(),
      avatar: z.string().optional(),
    }).parse(req.body)
    const { accessToken, refreshToken } = await svc.googleAuth(body.googleId, body.email, body.name, body.avatar)
    reply
      .setCookie('access_token', accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 })
      .setCookie('refresh_token', refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 })
      .send({ success: true })
  })

  // POST /auth/refresh
  app.post('/refresh', async (req, reply) => {
    const refreshToken = req.cookies['refresh_token']
    if (!refreshToken) return reply.code(401).send({ error: 'No refresh token' })
    const tokens = await svc.refreshTokens(refreshToken)
    reply
      .setCookie('access_token', tokens.accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 })
      .setCookie('refresh_token', tokens.refreshToken, { ...COOKIE_OPTS, maxAge: 7 * 24 * 60 * 60 })
      .send({ success: true })
  })

  // GET /auth/me
  app.get('/me', { preHandler: requireAuth }, async (req, reply) => {
    const user = await svc.getMe(req.user!.userId)
    return reply.send(user)
  })

  // POST /auth/logout
  app.post('/logout', async (req, reply) => {
    const refreshToken = req.cookies['refresh_token']
    if (refreshToken) await svc.logout(refreshToken)
    reply
      .clearCookie('access_token', { path: '/' })
      .clearCookie('refresh_token', { path: '/' })
      .send({ success: true })
  })
}
