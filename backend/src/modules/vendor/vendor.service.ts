import { PrismaClient } from '@prisma/client'
import { v2 as cloudinary } from 'cloudinary'
import { sanitizeText } from '../../lib/sanitize'

export class VendorService {
  constructor(private prisma: PrismaClient) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
  }

  async onboard(userId: string, data: {
    businessName: string
    businessType: string
    phone: string
    bio?: string
    address: string
    city: string
    state: string
    pincode: string
    latitude: number
    longitude: number
  }) {
    const existing = await this.prisma.vendorProfile.findUnique({ where: { userId } })
    if (existing) throw new Error('Vendor profile already exists')

    const profile = await this.prisma.vendorProfile.create({
      data: {
        userId,
        businessName: sanitizeText(data.businessName),
        businessType: sanitizeText(data.businessType),
        phone: data.phone,
        bio: data.bio ? sanitizeText(data.bio) : undefined,
        location: {
          create: {
            address: data.address,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
            latitude: data.latitude,
            longitude: data.longitude,
          },
        },
        metrics: { create: {} },
      },
      include: { location: true },
    })

    return profile
  }

  async getUploadSignature(userId: string, fileType: 'document' | 'listing-image') {
    const folder = `inneed/${fileType}s/${userId}`
    const timestamp = Math.round(Date.now() / 1000)

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      process.env.CLOUDINARY_API_SECRET!,
    )

    return {
      uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      apiKey: process.env.CLOUDINARY_API_KEY,
      timestamp,
      signature,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    }
  }

  async saveDocument(vendorId: string, docType: string, r2Key: string, fileName: string) {
    const profile = await this.prisma.vendorProfile.findUniqueOrThrow({
      where: { id: vendorId },
    })

    return this.prisma.vendorDocument.create({
      data: {
        vendorId: profile.id,
        type: docType as any,
        r2Key,
        fileName,
      },
    })
  }

  async getProfile(userId: string) {
    return this.prisma.vendorProfile.findUnique({
      where: { userId },
      include: { location: true, documents: true, metrics: true },
    })
  }
}
