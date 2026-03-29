import { randomInt } from 'crypto'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt'

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  // ─── OTP ─────────────────────────────────────────────────────────────────

  async requestOtp(phone: string) {
    const otp = randomInt(100000, 999999).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 min

    await this.prisma.otpRequest.create({
      data: { phone, otp, expiresAt },
    })

    // TODO: integrate MSG91 API for production SMS delivery
    if (process.env.NODE_ENV === 'development') {
      console.log(`[OTP] Phone: ${phone}, OTP: ${otp}`)
    }
    return { message: 'OTP sent successfully' }
  }

  async verifyOtp(phone: string, otp: string) {
    const record = await this.prisma.otpRequest.findFirst({
      where: {
        phone,
        otp,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!record) {
      // Track failed attempts for this phone to prevent brute force
      const recentAttempts = await this.prisma.otpRequest.count({
        where: {
          phone,
          isUsed: false,
          createdAt: { gt: new Date(Date.now() - 5 * 60 * 1000) },
        },
      })
      if (recentAttempts >= 5) {
        throw Object.assign(new Error('Too many OTP attempts. Please wait 5 minutes.'), { statusCode: 429 })
      }
      throw Object.assign(new Error('Invalid or expired OTP'), { statusCode: 400 })
    }

    await this.prisma.otpRequest.update({
      where: { id: record.id },
      data: { isUsed: true },
    })

    // Upsert user
    const user = await this.prisma.user.upsert({
      where: { phone },
      update: { lastLoginAt: new Date() },
      create: { phone, name: `User ${phone.slice(-4)}` },
    })

    return this.createSession(user.id, user.role)
  }

  // ─── Email/Password ───────────────────────────────────────────────────────

  async register(email: string, password: string, name: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } })
    if (existing) throw new Error('Email already registered')

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await this.prisma.user.create({
      data: { email, passwordHash, name },
    })

    return this.createSession(user.id, user.role)
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) throw new Error('Invalid credentials')
    if (!user.isActive) throw new Error('Account suspended')

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) throw new Error('Invalid credentials')

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    return this.createSession(user.id, user.role)
  }

  // ─── Google OAuth ─────────────────────────────────────────────────────────

  async googleAuth(accessToken: string) {
    // Verify the token with Google and fetch user profile server-side
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (!res.ok) {
      throw Object.assign(new Error('Invalid Google access token'), { statusCode: 401 })
    }

    const profile = await res.json() as { sub?: string; email?: string; name?: string; picture?: string }

    if (!profile.sub || !profile.email) {
      throw Object.assign(new Error('Could not retrieve Google profile'), { statusCode: 400 })
    }

    const user = await this.prisma.user.upsert({
      where: { googleId: profile.sub },
      update: { lastLoginAt: new Date(), avatar: profile.picture ?? undefined },
      create: {
        googleId: profile.sub,
        email: profile.email,
        name: profile.name || profile.email.split('@')[0],
        avatar: profile.picture,
      },
    })

    return this.createSession(user.id, user.role)
  }

  // ─── Token management ─────────────────────────────────────────────────────

  async refreshTokens(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken)

    const session = await this.prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    })

    if (!session || session.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token')
    }

    // Generate new tokens and rotate
    const accessToken = signAccessToken({ userId: payload.userId, role: session.user.role })
    const newRefreshToken = signRefreshToken({ userId: payload.userId, role: session.user.role })
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await this.prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: newRefreshToken, expiresAt },
    })

    return { accessToken, refreshToken: newRefreshToken }
  }

  async getMe(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        avatar: true,
        role: true,
        isVendorApproved: true,
        googleId: true,
        createdAt: true,
      },
    })
  }

  async updateMe(userId: string, data: { name?: string; avatar?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        avatar: true,
        role: true,
        isVendorApproved: true,
        googleId: true,
        createdAt: true,
      },
    })
  }

  async logout(refreshToken: string) {
    await this.prisma.session.deleteMany({ where: { refreshToken } })
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  private async createSession(userId: string, role: string) {
    const accessToken = signAccessToken({ userId, role })
    const refreshToken = signRefreshToken({ userId, role })
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await this.prisma.session.create({
      data: { userId, refreshToken, expiresAt },
    })

    return { accessToken, refreshToken }
  }
}
