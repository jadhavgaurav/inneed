'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { formatDate } from '@/lib/utils'

const STATUS_TABS = ['ALL', 'RESERVED', 'READY_FOR_PICKUP', 'ACTIVE', 'DUE', 'OVERDUE', 'CLOSED']
const STATUS_COLORS: Record<string, string> = {
  RESERVED: 'bg-yellow-100 text-yellow-700',
  READY_FOR_PICKUP: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-green-100 text-green-700',
  DUE: 'bg-orange-100 text-orange-700',
  OVERDUE: 'bg-red-100 text-red-700',
  CLOSED: 'bg-gray-100 text-gray-500',
}

export default function VendorBookingsPage() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState('ALL')
  const [pickupCode, setPickupCode] = useState('')
  const [returnModal, setReturnModal] = useState<string | null>(null)
  const [condition, setCondition] = useState<'good' | 'damaged' | 'missing_parts'>('good')

  const { data, isLoading } = useQuery({
    queryKey: ['vendor', 'bookings', status],
    queryFn: () => api.get(`/rentals/vendor/bookings${status !== 'ALL' ? `?status=${status}` : ''}`).then(r => r.data),
  })

  const approve = useMutation({
    mutationFn: (id: string) => api.post(`/rentals/${id}/approve`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['vendor'] }); toast.success('Approved') },
  })

  const pickup = useMutation({
    mutationFn: ({ id, code }: { id: string; code: string }) => api.post(`/rentals/${id}/pickup`, { pickupCode: code }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['vendor'] }); setPickupCode(''); toast.success('Pickup confirmed') },
    onError: () => toast.error('Invalid pickup code'),
  })

  const returnRental = useMutation({
    mutationFn: ({ id, cond }: { id: string; cond: string }) => api.post(`/rentals/${id}/return`, { condition: cond }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor'] })
      setReturnModal(null)
      toast.success('Return recorded')
    },
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Bookings & Rentals</h1>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto mb-6 pb-2">
        {STATUS_TABS.map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap ${status === s ? 'bg-primary text-white' : 'border border-border hover:bg-accent'}`}
          >
            {s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}

      <div className="space-y-3">
        {data?.rentals?.map((rental: any) => (
          <div key={rental.id} className="bg-white border border-border rounded-xl p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="font-medium">{rental.listing?.title}</p>
                <p className="text-sm text-muted-foreground">
                  {rental.customer?.name} · {rental.customer?.phone}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(rental.startDate)} → {formatDate(rental.endDate)}
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-1">Code: {rental.pickupCode}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${STATUS_COLORS[rental.status] || 'bg-gray-100'}`}>
                {rental.status.replace('_', ' ')}
              </span>
            </div>

            {/* Actions */}
            <div className="mt-3 flex flex-wrap gap-2">
              {rental.status === 'RESERVED' && (
                <button onClick={() => approve.mutate(rental.id)} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700">
                  Approve Booking
                </button>
              )}
              {rental.status === 'READY_FOR_PICKUP' && (
                <div className="flex gap-2">
                  <input
                    value={pickupCode}
                    onChange={(e) => setPickupCode(e.target.value)}
                    placeholder="6-digit code"
                    maxLength={6}
                    className="px-3 py-1.5 border border-border rounded-lg text-sm w-32 font-mono"
                  />
                  <button
                    onClick={() => pickup.mutate({ id: rental.id, code: pickupCode })}
                    disabled={pickupCode.length !== 6}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    Confirm Pickup
                  </button>
                </div>
              )}
              {['ACTIVE', 'DUE', 'OVERDUE'].includes(rental.status) && (
                <button onClick={() => setReturnModal(rental.id)} className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-90">
                  Record Return
                </button>
              )}
            </div>

            {returnModal === rental.id && (
              <div className="mt-3 border-t border-border pt-3">
                <p className="text-sm font-medium mb-2">Item condition on return:</p>
                <div className="flex gap-2 mb-3">
                  {[
                    { value: 'good', label: 'Good condition' },
                    { value: 'damaged', label: 'Damaged' },
                    { value: 'missing_parts', label: 'Missing parts' },
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name={`condition-${rental.id}`}
                        value={opt.value}
                        checked={condition === opt.value}
                        onChange={() => setCondition(opt.value as any)}
                        className="accent-primary"
                      />
                      <span className="text-sm">{opt.label}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => returnRental.mutate({ id: rental.id, cond: condition })}
                    className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-90"
                  >
                    Confirm Return
                  </button>
                  <button onClick={() => setReturnModal(null)} className="border border-border px-3 py-1.5 rounded-lg text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
