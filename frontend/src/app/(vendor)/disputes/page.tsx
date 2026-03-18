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
  createdAt: string
  order: { orderNumber: string }
  filer: { name: string; email: string }
  evidence: DisputeEvidence[]
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-destructive/10 text-destructive',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700',
  RESOLVED: 'bg-green-100 text-green-700',
  CLOSED: 'bg-muted text-muted-foreground',
}

function DisputeThread({ dispute }: { dispute: Dispute }) {
  const qc = useQueryClient()
  const { register, handleSubmit, reset } = useForm<{ message: string }>()

  const addEvidence = useMutation({
    mutationFn: (data: { message: string }) =>
      api.post(`/disputes/${dispute.id}/evidence`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vendor-dispute', dispute.id] })
      reset()
    },
  })

  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="text-sm text-muted-foreground">
        Filed by {dispute.filer.name} ({dispute.filer.email}) · {formatDate(dispute.createdAt)}
      </div>
      <p className="text-sm">{dispute.description}</p>

      {dispute.resolution && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
          <p className="font-medium text-green-800 mb-1">Resolution</p>
          <p className="text-green-700">{dispute.resolution}</p>
        </div>
      )}

      <Separator />
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
            placeholder="Add your response or evidence..."
            rows={3}
            {...register('message', { required: true, minLength: 5 })}
          />
          <Button type="submit" size="sm" disabled={addEvidence.isPending}>
            {addEvidence.isPending ? 'Submitting...' : 'Respond'}
          </Button>
        </form>
      )}
    </div>
  )
}

export default function VendorDisputesPage() {
  const [selected, setSelected] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['vendor-disputes'],
    queryFn: () =>
      api.get('/disputes/admin/disputes').then(r => r.data as { disputes: Dispute[] }),
  })

  const disputes = data?.disputes ?? []

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">Disputes</h1>
      <p className="text-sm text-muted-foreground">Disputes filed against your listings</p>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}
      {!isLoading && disputes.length === 0 && (
        <p className="text-muted-foreground">No disputes found.</p>
      )}

      <div className="grid gap-4">
        {disputes.map(d => (
          <Card
            key={d.id}
            className={`cursor-pointer transition-colors ${selected === d.id ? 'border-primary' : ''}`}
            onClick={() => setSelected(selected === d.id ? null : d.id)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-base">
                <span>{d.disputeNumber}</span>
                <Badge className={STATUS_COLORS[d.status]}>{d.status.replace('_', ' ')}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>Order #{d.order.orderNumber} · {d.type.replace(/_/g, ' ')}</p>
              <p>Filed by {d.filer.name} · {formatDate(d.createdAt)}</p>
            </CardContent>
            {selected === d.id && (
              <CardContent>
                <DisputeThread dispute={d} />
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
