import { PrismaClient, Prisma } from '@prisma/client'
import { nanoid } from 'nanoid'
import { sanitizeText } from '../../lib/sanitize'

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export class CatalogService {
  constructor(private prisma: PrismaClient) {}

  // ─── Categories ───────────────────────────────────────────────────────────

  async getCategories() {
    return this.prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: { children: { where: { isActive: true } } },
      orderBy: { sortOrder: 'asc' },
    })
  }

  async createCategory(data: { name: string; icon?: string; description?: string; parentId?: string }) {
    const slug = slugify(data.name)
    return this.prisma.category.create({
      data: { ...data, name: sanitizeText(data.name), description: data.description ? sanitizeText(data.description) : undefined, slug },
    })
  }

  async updateCategory(id: string, data: Partial<{ name: string; icon: string; description: string; isActive: boolean; sortOrder: number }>) {
    return this.prisma.category.update({ where: { id }, data })
  }

  // ─── Listings ─────────────────────────────────────────────────────────────

  async createListing(vendorUserId: string, data: {
    categoryId: string
    title: string
    description: string
    condition: string
    availableForRent: boolean
    availableForSale: boolean
    quantity: number
    features?: string[]
    latitude?: number
    longitude?: number
    rentPriceDaily?: number
    rentPriceWeekly?: number
    rentPriceMonthly?: number
    buyPrice?: number
    securityDeposit?: number
  }) {
    const { rentPriceDaily, rentPriceWeekly, rentPriceMonthly, buyPrice, securityDeposit, ...rest } = data
    return this.prisma.listing.create({
      data: {
        ...rest,
        title: sanitizeText(rest.title),
        description: sanitizeText(rest.description),
        features: rest.features?.map(sanitizeText),
        condition: rest.condition as any,
        vendorId: vendorUserId,
        pricing: {
          create: {
            rentPriceDaily: rentPriceDaily || null,
            rentPriceWeekly: rentPriceWeekly || null,
            rentPriceMonthly: rentPriceMonthly || null,
            buyPrice: buyPrice || null,
            securityDeposit: securityDeposit || 0,
          },
        },
      },
      include: { pricing: true, category: true },
    })
  }

  async updateListing(listingId: string, vendorUserId: string, data: any) {
    // Ensure vendor owns this listing
    const listing = await this.prisma.listing.findFirstOrThrow({
      where: { id: listingId, vendorId: vendorUserId },
    })

    const { rentPriceDaily, rentPriceWeekly, rentPriceMonthly, buyPrice, securityDeposit, ...rest } = data

    return this.prisma.listing.update({
      where: { id: listing.id },
      data: {
        ...rest,
        pricing: {
          update: {
            rentPriceDaily, rentPriceWeekly, rentPriceMonthly, buyPrice, securityDeposit,
          },
        },
      },
      include: { pricing: true },
    })
  }

  async deleteListing(listingId: string, vendorUserId: string) {
    await this.prisma.listing.findFirstOrThrow({ where: { id: listingId, vendorId: vendorUserId } })
    return this.prisma.listing.update({
      where: { id: listingId },
      data: { status: 'ARCHIVED' },
    })
  }

  async getListingImagePresignedUrls(count: number): Promise<{ urls: string[]; keys: string[] }> {
    // Placeholder — real implementation in upload module
    return { urls: [], keys: [] }
  }

  async addListingImages(listingId: string, vendorUserId: string, images: { r2Key: string; isPrimary?: boolean }[]) {
    await this.prisma.listing.findFirstOrThrow({ where: { id: listingId, vendorId: vendorUserId } })

    const data = images.map((img, i) => ({
      listingId,
      r2Key: img.r2Key,
      // r2Key stores the Cloudinary public_id; build delivery URL
      url: img.r2Key.startsWith('http') ? img.r2Key : `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${img.r2Key}`,
      isPrimary: img.isPrimary || i === 0,
      sortOrder: i,
    }))

    return this.prisma.listingMedia.createMany({ data })
  }

  // ─── Search ───────────────────────────────────────────────────────────────

  async searchListings(params: {
    q?: string
    categoryId?: string
    categorySlug?: string
    priceMin?: number
    priceMax?: number
    condition?: string
    mode?: 'RENT' | 'BUY'
    lat?: number
    lng?: number
    radius?: number
    page?: number
    limit?: number
  }) {
    const {
      q, categoryId, categorySlug, priceMin, priceMax, condition, mode,
      lat, lng, radius = 25, page = 1, limit = 20,
    } = params

    const skip = (page - 1) * limit

    // Resolve categorySlug → categoryId if needed
    let resolvedCategoryId = categoryId
    if (!resolvedCategoryId && categorySlug) {
      const cat = await this.prisma.category.findUnique({
        where: { slug: categorySlug.toLowerCase() },
        select: { id: true },
      })
      if (cat) resolvedCategoryId = cat.id
    }

    // Build WHERE clause
    const where: any = {
      status: 'ACTIVE',
    }

    if (resolvedCategoryId) where.categoryId = resolvedCategoryId
    if (condition) where.condition = condition as any
    if (mode === 'RENT') where.availableForRent = true
    if (mode === 'BUY') where.availableForSale = true

    // Full-text search via case-insensitive contains (pg_trgm in real prod)
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ]
    }

    // Price filter via pricing relation
    if (priceMin || priceMax) {
      where.pricing = {
        rentPriceDaily: {
          ...(priceMin ? { gte: priceMin } : {}),
          ...(priceMax ? { lte: priceMax } : {}),
        },
      }
    }

    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        include: {
          pricing: true,
          media: { where: { isPrimary: true }, take: 1 },
          category: true,
          vendor: {
            select: {
              id: true,
              name: true,
              avatar: true,
              vendorProfile: {
                include: { location: true },
              },
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.listing.count({ where }),
    ])

    return { listings, total, page, limit }
  }

  async getListingById(id: string) {
    return this.prisma.listing.findUniqueOrThrow({
      where: { id },
      include: {
        pricing: true,
        media: { orderBy: { sortOrder: 'asc' } },
        category: true,
        vendor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            vendorProfile: {
              include: { location: true, metrics: true },
            },
          },
        },
        reviews: {
          where: { isVisible: true },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true, avatar: true } } },
        },
      },
    })
  }

  async getVendorListings(vendorUserId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [listings, total] = await Promise.all([
      this.prisma.listing.findMany({
        where: { vendorId: vendorUserId, status: { not: 'ARCHIVED' } },
        include: { pricing: true, media: { where: { isPrimary: true }, take: 1 }, category: true },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.listing.count({ where: { vendorId: vendorUserId, status: { not: 'ARCHIVED' } } }),
    ])
    return { listings, total, page, limit }
  }
}
