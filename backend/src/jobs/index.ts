import PgBoss from 'pg-boss'
import { PrismaClient } from '@prisma/client'

export async function setupJobs(boss: PgBoss, prisma: PrismaClient) {
  // Overdue rental check — runs every hour
  await boss.schedule('overdue-rental-check', '0 * * * *')

  await boss.work('overdue-rental-check', async () => {
    const now = new Date()

    // Mark DUE rentals
    await prisma.rental.updateMany({
      where: {
        status: 'ACTIVE',
        endDate: { lte: now },
      },
      data: { status: 'DUE' },
    })

    // Mark OVERDUE (> 24hrs past due)
    const overdueCutoff = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    await prisma.rental.updateMany({
      where: {
        status: 'DUE',
        endDate: { lte: overdueCutoff },
      },
      data: { status: 'OVERDUE' },
    })

    console.log('[jobs] Overdue rental check completed at', now.toISOString())
  })

  console.log('[jobs] Background jobs registered')
}
