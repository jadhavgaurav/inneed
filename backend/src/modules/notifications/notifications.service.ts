import { PrismaClient, NotificationType } from '@prisma/client'

export class NotificationsService {
  constructor(private prisma: PrismaClient) {}

  async createNotification(data: {
    userId: string
    type: NotificationType
    title: string
    message: string
    link?: string
  }) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
      },
    })
  }

  async getNotifications(userId: string, page: number, limit: number) {
    const [notifications, total, unread] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ])
    return { notifications, total, unread, page, limit, pages: Math.ceil(total / limit) }
  }

  async markAsRead(userId: string, ids?: string[]) {
    const where = ids?.length
      ? { userId, id: { in: ids } }
      : { userId, isRead: false }
    const { count } = await this.prisma.notification.updateMany({
      where,
      data: { isRead: true },
    })
    return { marked: count }
  }

  async unreadCount(userId: string) {
    const count = await this.prisma.notification.count({ where: { userId, isRead: false } })
    return { count }
  }

  // Convenience helpers
  async notifyOrderConfirmed(customerId: string, orderNumber: string, orderId: string) {
    await this.createNotification({
      userId: customerId,
      type: NotificationType.ORDER,
      title: 'Order Confirmed',
      message: `Your order #${orderNumber} has been confirmed. Pickup codes are ready.`,
      link: `/orders/${orderId}/confirmation`,
    })
    console.log(`[EMAIL] Order confirmed: ${orderNumber} → customer ${customerId}`)
  }

  async notifyRentalApproved(customerId: string, listingTitle: string, rentalId: string) {
    await this.createNotification({
      userId: customerId,
      type: NotificationType.RENTAL,
      title: 'Rental Approved',
      message: `Your rental for "${listingTitle}" has been approved. It's ready for pickup.`,
      link: `/rentals`,
    })
    console.log(`[EMAIL] Rental approved: ${rentalId} → customer ${customerId}`)
  }

  async notifyReturnReminder(customerId: string, listingTitle: string, rentalId: string) {
    await this.createNotification({
      userId: customerId,
      type: NotificationType.RENTAL,
      title: 'Return Reminder',
      message: `Your rental for "${listingTitle}" is due for return soon.`,
      link: `/rentals`,
    })
    console.log(`[SMS] Return reminder: ${rentalId} → customer ${customerId}`)
  }

  async notifyDisputeOpened(vendorId: string, orderId: string) {
    await this.createNotification({
      userId: vendorId,
      type: NotificationType.DISPUTE,
      title: 'Dispute Opened',
      message: 'A dispute has been filed for one of your orders. Please provide evidence.',
      link: `/disputes`,
    })
  }

  async notifyDisputeResolved(userId: string, disputeId: string, resolution: string) {
    await this.createNotification({
      userId,
      type: NotificationType.DISPUTE,
      title: 'Dispute Resolved',
      message: `Your dispute has been resolved: ${resolution.substring(0, 100)}`,
      link: `/disputes/${disputeId}`,
    })
  }
}
