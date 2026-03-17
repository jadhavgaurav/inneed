'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { CheckCircle, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { formatINR, formatDate } from '@/lib/utils'

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>()

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => api.get(`/orders/${id}`).then(r => r.data),
  })

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success('Pickup code copied!')
  }

  if (isLoading) return <div className="max-w-2xl mx-auto px-4 py-8 text-center">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>

      <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
      <p className="text-muted-foreground mb-2">
        Your order <span className="font-mono font-semibold">{order?.orderNumber}</span> is confirmed.
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        The vendor will approve your booking. You&apos;ll receive a notification when it&apos;s ready for pickup.
      </p>

      {/* Rentals with pickup codes */}
      {order?.lines?.some((l: any) => l.rental) && (
        <div className="text-left mb-8">
          <h2 className="font-semibold mb-3">Your Rentals</h2>
          <div className="space-y-3">
            {order.lines.filter((l: any) => l.rental).map((line: any) => (
              <div key={line.id} className="bg-accent rounded-xl p-4">
                <p className="font-medium text-sm">{line.listing?.title || 'Item'}</p>
                {line.startDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(line.startDate)} → {formatDate(line.endDate)}
                  </p>
                )}
                {line.rental?.pickupCode && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">Pickup Code (show to vendor)</p>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-2xl font-bold tracking-[0.3em] bg-white px-4 py-2 rounded-lg border border-border">
                        {line.rental.pickupCode}
                      </span>
                      <button onClick={() => copyCode(line.rental.pickupCode)} className="p-2 hover:bg-white rounded-lg">
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order total */}
      {order && (
        <div className="text-left bg-white border border-border rounded-xl p-4 mb-8 text-sm">
          <div className="flex justify-between mb-1"><span>Subtotal</span><span>{formatINR(order.subtotal)}</span></div>
          <div className="flex justify-between mb-1"><span>Deposits</span><span>{formatINR(order.depositTotal)}</span></div>
          <div className="flex justify-between font-bold"><span>Total paid</span><span>{formatINR(order.total)}</span></div>
        </div>
      )}

      <div className="flex gap-3 justify-center">
        <Link href="/rentals" className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90">
          View My Rentals
        </Link>
        <Link href="/" className="border border-border px-6 py-3 rounded-lg font-medium hover:bg-accent">
          Back to Home
        </Link>
      </div>
    </div>
  )
}
