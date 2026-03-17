'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import api from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatDate, formatINR } from '@/lib/utils'

interface Dispute {
  id: string
  disputeNumber: string
  type: string
  status: string
  createdAt: string
  order: { orderNumber: string }
  filer: { name: string; email: string }
  _count: { evidence: number }
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-700',
}

function ResolveForm({ disputeId, onDone }: { disputeId: string; onDone: () => void }) {
  const { register, handleSubmit } = useForm<{ resolution: string; depositAdjustment: string }>()

  const resolve = useMutation({
    mutationFn: (data: { resolution: string; depositAdjustment?: number }) =>
      api.post(`/disputes/admin/disputes/${disputeId}/resolve`, data),
    onSuccess: onDone,
  })

  return (
    <form
      onSubmit={handleSubmit(d =>
        resolve.mutate({
          resolution: d.resolution,
          depositAdjustment: d.depositAdjustment ? parseFloat(d.depositAdjustment) : undefined,
        })
      )}
      className="space-y-3 border-t pt-4 mt-4"
    >
      <div className="space-y-1">
        <Label>Resolution</Label>
        <Textarea
          placeholder="Describe the resolution decision..."
          rows={3}
          {...register('resolution', { required: true, minLength: 10 })}
        />
      </div>
      <div className="space-y-1">
        <Label>Deposit Deduction Amount (₹, optional)</Label>
        <Input
          type="number"
          min={0}
          step={0.01}
          placeholder="0"
          {...register('depositAdjustment')}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={resolve.isPending}>
          {resolve.isPending ? 'Resolving...' : 'Resolve Dispute'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onDone}>Cancel</Button>
      </div>
      {resolve.isError && (
        <p className="text-sm text-red-600">Failed to resolve dispute.</p>
      )}
    </form>
  )
}

export default function AdminDisputesPage() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [resolving, setResolving] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-disputes', statusFilter],
    queryFn: () => {
      const params = statusFilter !== 'all' ? `?status=${statusFilter}` : ''
      return api.get(`/disputes/admin/disputes${params}`).then(r => r.data as { disputes: Dispute[]; total: number })
    },
  })

  const disputes = data?.disputes ?? []

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dispute Queue</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading disputes...</p>}
      {!isLoading && disputes.length === 0 && (
        <p className="text-muted-foreground">No disputes found.</p>
      )}

      <div className="grid gap-4">
        {disputes.map(d => (
          <Card key={d.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span>{d.disputeNumber}</span>
                <Badge className={STATUS_COLORS[d.status]}>{d.status.replace('_', ' ')}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Order</p>
                  <p className="font-medium">#{d.order.orderNumber}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-medium">{d.type.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Filed By</p>
                  <p className="font-medium">{d.filer.name}</p>
                  <p className="text-xs text-muted-foreground">{d.filer.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Evidence Count</p>
                  <p className="font-medium">{d._count.evidence} pieces</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{formatDate(d.createdAt)}</p>

              {(d.status === 'OPEN' || d.status === 'UNDER_REVIEW') && resolving !== d.id && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setResolving(d.id)}
                >
                  Resolve Dispute
                </Button>
              )}

              {resolving === d.id && (
                <ResolveForm
                  disputeId={d.id}
                  onDone={() => {
                    setResolving(null)
                    qc.invalidateQueries({ queryKey: ['admin-disputes'] })
                  }}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
