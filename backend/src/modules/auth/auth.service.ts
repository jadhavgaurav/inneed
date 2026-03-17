import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { nanoid } from 'nanoid'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt'

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  // ─── OTP ─────────────────────────────────────────────────────────────────

  async requestOtp(phone: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 min

    await this.prisma.otpRequest.create({
      data: { phone, otp, expiresAt },
    })

    // Mock SMS — in prod call MSG91 API
    console.log(`[OTP] Phone: ${phone}, OTP: ${otp}`)
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

    if (!record) throw new Error('Invalid or expired OTP')

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

  async googleAuth(googleId: string, email: string, name: string, avatar?: string) {
    const user = await this.prisma.user.upsert({
      where: { googleId },
      update: { lastLoginAt: new Date(), avatar: avatar ?? undefined },
      create: { googleId, email, name, avatar },
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

    // Rotate refresh token
    const newRefreshToken = nanoid(64)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await this.prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: newRefreshToken, expiresAt },
    })

    const accessToken = signAccessToken({ userId: payload.userId, role: session.user.role })
    const newRefresh = signRefreshToken({ userId: payload.userId, role: session.user.role })

    // Update the session with the new JWT refresh token
    await this.prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: newRefresh },
    })

    return { accessToken, refreshToken: newRefresh }
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
