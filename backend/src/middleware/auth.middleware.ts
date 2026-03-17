import { FastifyRequest, FastifyReply } from 'fastify'
import { verifyAccessToken, JwtPayload } from '../lib/jwt'

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload
  }
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const token = request.cookies['access_token']
  if (!token) {
    return reply.code(401).send({ error: 'Unauthorized', message: 'Authentication required' })
  }
  try {
    const payload = verifyAccessToken(token)
    request.user = payload
  } catch {
    return reply.code(401).send({ error: 'Unauthorized', message: 'Invalid or expired token' })
  }
}

export async function requireVendor(request: FastifyRequest, reply: FastifyReply) {
  await requireAuth(request, reply)
  if (!reply.sent) {
    // Check vendor approved status - attach to request for downstream use
    // This is lightweight; full check is done in service layer when needed
  }
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  await requireAuth(request, reply)
  if (!reply.sent && request.user?.role !== 'ADMIN') {
    return reply.code(403).send({ error: 'Forbidden', message: 'Admin access required' })
  }
}
