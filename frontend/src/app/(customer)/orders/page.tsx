'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatINR, formatDate } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-destructive/10 text-destructive',
  COMPLETED: 'bg-muted text-muted-foreground',
}

export default function CustomerOrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['customer', 'orders'],
    queryFn: () => api.get('/checkout/orders').then(r => r.data),
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {isLoading && <p className="text-muted-foreground">Loading orders...</p>}

      {!isLoading && data?.orders?.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">No orders yet</p>
          <Link href="/search" className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:opacity-90">
            Start Shopping
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {data?.orders?.map((order: any) => (
          <div key={order.id} className="bg-white border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-mono text-sm font-semibold">{order.orderNumber}</p>
                <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] || 'bg-muted text-muted-foreground'}`}>
                  {order.status.replace('_', ' ')}
                </span>
                <span className="font-semibold">{formatINR(order.total)}</span>
              </div>
            </div>
            <div className="space-y-1">
              {order.lines?.map((line: any) => (
                <div key={line.id} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{line.listing?.title}</span>
                  <span className="text-xs bg-accent px-2 py-0.5 rounded">{line.mode}</span>
                </div>
              ))}
            </div>
            <Link href={`/orders/${order.id}/confirmation`} className="mt-3 inline-block text-primary text-sm hover:underline">
              View details →
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
