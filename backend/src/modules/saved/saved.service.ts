import { PrismaClient } from '@prisma/client'

export class SavedService {
  constructor(private prisma: PrismaClient) {}

  async saveItem(userId: string, listingId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } })
    if (!listing) throw Object.assign(new Error('Listing not found'), { statusCode: 404 })

    return this.prisma.savedItem.upsert({
      where: { userId_listingId: { userId, listingId } },
      create: { userId, listingId },
      update: {},
      include: { listing: { select: { id: true, title: true } } },
    })
  }

  async removeItem(userId: string, listingId: string) {
    const item = await this.prisma.savedItem.findUnique({
      where: { userId_listingId: { userId, listingId } },
    })
    if (!item) throw Object.assign(new Error('Item not in saved list'), { statusCode: 404 })
    await this.prisma.savedItem.delete({ where: { userId_listingId: { userId, listingId } } })
    return { removed: true }
  }

  async getSavedItems(userId: string, page: number, limit: number) {
    const [items, total] = await Promise.all([
      this.prisma.savedItem.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          listing: {
            include: {
              media: { where: { isPrimary: true }, take: 1 },
              pricing: { select: { rentPriceDaily: true, rentPriceWeekly: true, buyPrice: true } },
            },
          },
        },
      }),
      this.prisma.savedItem.count({ where: { userId } }),
    ])
    return { items, total, page, limit, pages: Math.ceil(total / limit) }
  }

  async isSaved(userId: string, listingId: string) {
    const item = await this.prisma.savedItem.findUnique({
      where: { userId_listingId: { userId, listingId } },
    })
    return { saved: !!item }
  }
}
