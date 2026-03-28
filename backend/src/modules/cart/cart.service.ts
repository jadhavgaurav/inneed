import { PrismaClient } from '@prisma/client'

export class CartService {
  constructor(private prisma: PrismaClient) {}

  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            listing: { include: { pricing: true, media: { where: { isPrimary: true }, take: 1 } } },
          },
        },
      },
    })
    if (!cart) return { items: [] }
    return cart
  }

  async addItem(userId: string, data: {
    listingId: string
    mode: 'RENT' | 'BUY'
    quantity: number
    startDate?: string
    endDate?: string
    damageProtection?: boolean
  }) {
    // Ensure cart exists
    let cart = await this.prisma.cart.findUnique({ where: { userId } })
    if (!cart) cart = await this.prisma.cart.create({ data: { userId } })

    // Check if the same listing+mode already exists in cart
    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, listingId: data.listingId, mode: data.mode },
    })

    if (existingItem) {
      // Update quantity instead of creating a duplicate
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + data.quantity,
          startDate: data.startDate ? new Date(data.startDate) : existingItem.startDate,
          endDate: data.endDate ? new Date(data.endDate) : existingItem.endDate,
          damageProtection: data.damageProtection ?? existingItem.damageProtection,
        },
        include: { listing: { include: { pricing: true } } },
      })
    }

    return this.prisma.cartItem.create({
      data: {
        cartId: cart.id,
        listingId: data.listingId,
        mode: data.mode,
        quantity: data.quantity,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        damageProtection: data.damageProtection || false,
      },
      include: { listing: { include: { pricing: true } } },
    })
  }

  async updateItem(userId: string, itemId: string, data: {
    quantity?: number
    startDate?: string
    endDate?: string
  }) {
    const cart = await this.prisma.cart.findUniqueOrThrow({ where: { userId } })
    return this.prisma.cartItem.update({
      where: { id: itemId, cartId: cart.id },
      data: {
        quantity: data.quantity,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    })
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.prisma.cart.findUniqueOrThrow({ where: { userId } })
    return this.prisma.cartItem.delete({ where: { id: itemId, cartId: cart.id } })
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } })
    if (!cart) return
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
  }
}
