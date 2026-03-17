'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import api from '@/lib/api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { formatDate } from '@/lib/utils'

interface DisputeEvidence {
  id: string
  userId: string
  message: string
  images: string[]
  createdAt: string
}

interface Dispute {
  id: string
  disputeNumber: string
  orderId: string
  type: string
  description: string
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED'
  resolution?: string
  resolvedAt?: string
  createdAt: string
  order: { orderNumber: string }
  evidence: DisputeEvidence[]
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-700',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-700',
}

function DisputeDetail({ disputeId }: { disputeId: string }) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset } = useForm<{ message: string }>()

  const { data: dispute } = useQuery({
    queryKey: ['dispute', disputeId],
    queryFn: () => api.get(`/disputes/${disputeId}`).then(r => r.data as Dispute),
  })

  const addEvidence = useMutation({
    mutationFn: (data: { message: string }) =>
      api.post(`/disputes/${disputeId}/evidence`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dispute', disputeId] })
      reset()
    },
  })

  if (!dispute) return <div className="p-4 text-muted-foreground">Loading...</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="font-semibold">{dispute.disputeNumber}</span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[dispute.status]}`}>
          {dispute.status.replace('_', ' ')}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">Order #{dispute.order.orderNumber} · {formatDate(dispute.createdAt)}</p>
      <p className="text-sm">{dispute.description}</p>

      {dispute.resolution && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
          <p className="font-medium text-green-800 mb-1">Resolution</p>
          <p className="text-green-700">{dispute.resolution}</p>
        </div>
      )}

      <Separator />
      <p className="text-sm font-medium">Evidence Thread</p>
      <div className="space-y-3">
        {dispute.evidence.map(ev => (
          <div key={ev.id} className="bg-muted/40 rounded-lg p-3 text-sm">
            <p>{ev.message}</p>
            <p className="text-xs text-muted-foreground mt-1">{formatDate(ev.createdAt)}</p>
          </div>
        ))}
      </div>

      {(dispute.status === 'OPEN' || dispute.status === 'UNDER_REVIEW') && (
        <form onSubmit={handleSubmit(d => addEvidence.mutate(d))} className="space-y-2">
          <Textarea
            placeholder="Add your evidence or response..."
            rows={3}
            {...register('message', { required: true, minLength: 5 })}
          />
          <Button type="submit" size="sm" disabled={addEvidence.isPending}>
            {addEvidence.isPending ? 'Submitting...' : 'Add Evidence'}
          </Button>
        </form>
      )}
    </div>
  )
}

export default function CustomerDisputesPage() {
  const [selected, setSelected] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['my-disputes'],
    queryFn: async () => {
      // Get all orders and find disputes for them
      const ordersRes = await api.get('/checkout/orders')
      const orders: { id: string }[] = ordersRes.data.orders ?? []
      const disputePromises = orders.map(o =>
        api.get(`/disputes/${o.id}`).catch(() => null)
      )
      const results = await Promise.all(disputePromises)
      return results.filter(Boolean).map(r => r?.data as Dispute)
    },
  })

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">My Disputes</h1>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {!isLoading && (!data || data.length === 0) && (
        <p className="text-muted-foreground">No disputes found.</p>
      )}

      <div className="grid gap-4">
        {data?.map(d => (
          <Card
            key={d.id}
            className={`cursor-pointer transition-colors ${selected === d.id ? 'border-primary' : ''}`}
            onClick={() => setSelected(selected === d.id ? null : d.id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span>{d.disputeNumber}</span>
                <Badge className={STATUS_COLORS[d.status]}>{d.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Order #{d.order.orderNumber} · {d.type.replace(/_/g, ' ')}</p>
              <p>{formatDate(d.createdAt)}</p>
            </CardContent>
            {selected === d.id && (
              <CardContent className="border-t pt-4">
                <DisputeDetail disputeId={d.id} />
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
