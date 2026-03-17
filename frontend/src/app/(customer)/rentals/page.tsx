'use client'

import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  RESERVED: 'bg-yellow-100 text-yellow-700',
  READY_FOR_PICKUP: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-green-100 text-green-700',
  DUE: 'bg-orange-100 text-orange-700',
  OVERDUE: 'bg-red-100 text-red-700',
  RETURNED: 'bg-gray-100 text-gray-600',
  CLOSED: 'bg-gray-50 text-gray-500',
}

export default function CustomerRentalsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['customer', 'rentals'],
    queryFn: () => api.get('/rentals/customer/rentals').then(r => r.data),
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Rentals</h1>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}

      {!isLoading && data?.rentals?.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">No rentals yet</p>
          <Link href="/search" className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:opacity-90">
            Browse Items to Rent
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {data?.rentals?.map((rental: any) => (
          <div key={rental.id} className="bg-white border border-border rounded-xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Link href={`/items/${rental.listingId}`} className="font-semibold hover:underline">
                  {rental.listing?.title}
                </Link>
                <p className="text-sm text-muted-foreground mt-1">
                  From {rental.vendor?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(rental.startDate)} → {formatDate(rental.endDate)}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[rental.status] || 'bg-gray-100'}`}>
                {rental.status.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Pickup code for READY_FOR_PICKUP */}
            {rental.status === 'READY_FOR_PICKUP' && (
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm font-medium text-blue-800 mb-2">Show this code to the vendor on pickup:</p>
                <div className="font-mono text-3xl font-bold tracking-[0.3em] text-blue-900 text-center py-2 bg-white rounded-lg border border-blue-200">
                  {rental.pickupCode}
                </div>
              </div>
            )}

            {/* Active rental countdown */}
            {['ACTIVE', 'DUE', 'OVERDUE'].includes(rental.status) && (
              <div className="mt-3 text-sm">
                <span className={rental.status === 'OVERDUE' ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                  Return by: {formatDate(rental.endDate)}
                  {rental.status === 'OVERDUE' && ' — OVERDUE'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
