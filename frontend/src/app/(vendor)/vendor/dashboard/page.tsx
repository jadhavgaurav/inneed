'use client'

import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Package, DollarSign, Clock, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { formatINR, formatDate } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  RESERVED: 'bg-yellow-100 text-yellow-700',
  READY_FOR_PICKUP: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-green-100 text-green-700',
  DUE: 'bg-primary/10 text-primary',
  OVERDUE: 'bg-destructive/10 text-destructive',
  RETURNED: 'bg-muted text-muted-foreground',
  CLOSED: 'bg-muted text-muted-foreground',
  CANCELLED: 'bg-destructive/10 text-destructive',
}

export default function VendorDashboardPage() {
  const queryClient = useQueryClient()

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['vendor', 'dashboard'],
    queryFn: () => api.get('/rentals/vendor/dashboard').then(r => r.data),
  })

  const approve = useMutation({
    mutationFn: (id: string) => api.post(`/rentals/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor', 'dashboard'] })
      toast.success('Booking approved')
    },
  })

  const reject = useMutation({
    mutationFn: (id: string) => api.post(`/rentals/${id}/reject`, { reason: 'Not available for requested dates' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor', 'dashboard'] })
      toast.success('Booking rejected')
    },
  })

  if (isLoading) return <div className="max-w-6xl mx-auto px-4 py-8">Loading dashboard...</div>

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
        <Link href="/vendor/listings/new" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
          + New Listing
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Clock, label: 'Pending Approvals', value: dashboard?.pendingApprovals || 0, color: 'text-yellow-600' },
          { icon: Package, label: 'Active Rentals', value: dashboard?.activeRentals || 0, color: 'text-green-600' },
          { icon: DollarSign, label: 'Total Earnings', value: formatINR(dashboard?.totalEarnings || 0), color: 'text-primary' },
          { icon: CheckCircle, label: 'Listings', value: dashboard?.listingsCount || 0, color: 'text-blue-600' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white border border-border rounded-xl p-4">
            <div className={`${color} mb-2`}><Icon className="h-5 w-5" /></div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Bookings</h2>
          <Link href="/vendor/bookings" className="text-primary text-sm hover:underline">View all →</Link>
        </div>

        {dashboard?.recentRentals?.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No bookings yet</div>
        )}

        <div className="space-y-3">
          {dashboard?.recentRentals?.map((rental: any) => (
            <div key={rental.id} className="bg-white border border-border rounded-xl p-4 flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium">{rental.listing?.title}</p>
                <p className="text-sm text-muted-foreground">
                  by {rental.customer?.name} · {formatDate(rental.startDate)} – {formatDate(rental.endDate)}
                </p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[rental.status] || 'bg-muted text-muted-foreground'}`}>
                {rental.status.replace('_', ' ')}
              </span>
              {rental.status === 'RESERVED' && (
                <div className="flex gap-2">
                  <button onClick={() => approve.mutate(rental.id)} className="bg-green-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-green-700">
                    Approve
                  </button>
                  <button onClick={() => reject.mutate(rental.id)} className="bg-destructive text-white px-3 py-1 rounded-lg text-xs font-medium hover:opacity-90">
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
