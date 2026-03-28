'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { formatINR, formatDate } from '@/lib/utils'

const TYPE_COLORS: Record<string, string> = {
  EARNING: 'text-green-600',
  COMMISSION: 'text-destructive',
  PAYOUT: 'text-blue-600',
  REFUND_DEDUCTION: 'text-primary',
  DEPOSIT_FORFEITURE: 'text-primary',
}

export default function VendorEarningsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['vendor', 'earnings'],
    queryFn: () => api.get('/rentals/vendor/earnings').then(r => r.data),
  })

  const balance = data?.entries?.[0]?.balance || 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Earnings</h1>

      <div className="bg-primary text-white rounded-2xl p-6 mb-6">
        <p className="text-sm opacity-80">Available Balance</p>
        <p className="text-4xl font-bold mt-1">{formatINR(balance)}</p>
        <button className="mt-4 bg-white text-primary px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
          Request Payout
        </button>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading transactions...</p>}

      <div className="space-y-2">
        {data?.entries?.map((entry: any) => (
          <div key={entry.id} className="bg-white border border-border rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{entry.description || entry.type.replace('_', ' ')}</p>
              <p className="text-xs text-muted-foreground">{formatDate(entry.createdAt)}</p>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${TYPE_COLORS[entry.type] || 'text-foreground'}`}>
                {entry.amount >= 0 ? '+' : ''}{formatINR(entry.amount)}
              </p>
              <p className="text-xs text-muted-foreground">Balance: {formatINR(entry.balance)}</p>
            </div>
          </div>
        ))}

        {!isLoading && data?.entries?.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">No transactions yet</div>
        )}
      </div>
    </div>
  )
}
