'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'

interface PendingVendor {
  id: string
  businessName: string
  businessType: string
  phone: string
  status: string
  createdAt: string
  user: { name: string; email: string; phone: string }
  location: { address: string; city: string; state: string } | null
  documents: { id: string; type: string; fileName: string }[]
}

export default function AdminVendorsPage() {
  const queryClient = useQueryClient()
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'vendors', 'pending'],
    queryFn: () => api.get<{ vendors: PendingVendor[] }>('/admin/vendors/pending').then(r => r.data),
  })

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.post(`/admin/vendors/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'vendors', 'pending'] })
      toast.success('Vendor approved successfully')
    },
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.post(`/admin/vendors/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'vendors', 'pending'] })
      setRejectId(null)
      setRejectReason('')
      toast.success('Vendor rejected')
    },
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Pending Vendor Applications</h1>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}

      {data?.vendors.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No pending applications</div>
      )}

      <div className="space-y-4">
        {data?.vendors.map((vendor) => (
          <div key={vendor.id} className="bg-white border border-border rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold text-lg">{vendor.businessName}</h2>
                <p className="text-sm text-muted-foreground">{vendor.businessType} · {vendor.phone}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Owner: {vendor.user.name} ({vendor.user.email || vendor.user.phone})
                </p>
                {vendor.location && (
                  <p className="text-sm text-muted-foreground">
                    {vendor.location.address}, {vendor.location.city}, {vendor.location.state}
                  </p>
                )}
                <div className="flex gap-2 mt-2">
                  {vendor.documents.map(doc => (
                    <span key={doc.id} className="text-xs bg-accent px-2 py-1 rounded-full">{doc.type}</span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => approveMutation.mutate(vendor.id)}
                  disabled={approveMutation.isPending}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => setRejectId(vendor.id)}
                  className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
                >
                  Reject
                </button>
              </div>
            </div>

            {rejectId === vendor.id && (
              <div className="mt-4 border-t border-border pt-4">
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection..."
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => rejectMutation.mutate({ id: vendor.id, reason: rejectReason })}
                    disabled={rejectReason.length < 5 || rejectMutation.isPending}
                    className="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
                  >
                    Confirm Rejection
                  </button>
                  <button onClick={() => setRejectId(null)} className="border border-border px-4 py-2 rounded-lg text-sm">
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
