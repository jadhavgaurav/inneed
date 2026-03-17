import { PrismaClient } from '@prisma/client'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { nanoid } from 'nanoid'

export class VendorService {
  private s3: S3Client

  constructor(private prisma: PrismaClient) {
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
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
        businessName: data.businessName,
        businessType: data.businessType,
        phone: data.phone,
        bio: data.bio,
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

  async getPresignedUrl(userId: string, fileType: 'document' | 'listing-image', mimeType: string) {
    const ext = mimeType.split('/')[1] || 'jpg'
    const key = `${fileType}s/${userId}/${nanoid()}.${ext}`

    const url = await getSignedUrl(
      this.s3,
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME || 'inneed-uploads',
        Key: key,
        ContentType: mimeType,
      }),
      { expiresIn: 3600 }
    )

    return { url, key }
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
