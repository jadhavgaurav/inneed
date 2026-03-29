'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Eye, Edit, Pause, Archive, Repeat, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { formatINR } from '@/lib/utils'

export default function VendorListingsPage() {
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['vendor', 'listings'],
    queryFn: () => api.get('/vendor/listings').then(r => r.data),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.put(`/vendor/listings/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor', 'listings'] })
      toast.success('Listing updated')
    },
  })

  const STATUS_COLORS: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    PAUSED: 'bg-yellow-100 text-yellow-700',
    DRAFT: 'bg-muted text-muted-foreground',
    ARCHIVED: 'bg-destructive/10 text-destructive',
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Listings</h1>
        <Link href="/vendor/listings/new" className="bg-primary text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Listing
        </Link>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading...</p>}

      {data?.listings?.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">No listings yet</p>
          <Link href="/vendor/listings/new" className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:opacity-90">Create your first listing</Link>
        </div>
      )}

      <div className="space-y-3">
        {data?.listings?.map((listing: any) => (
          <div key={listing.id} className="bg-white border border-border rounded-xl p-4 flex items-center gap-4">
            <div className="w-16 h-16 bg-accent rounded-lg flex-shrink-0 overflow-hidden relative">
              {listing.media?.[0]?.url ? (
                <Image src={listing.media[0].url} alt={listing.title} fill className="object-cover" sizes="64px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No img</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{listing.title}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-muted-foreground">{listing.category?.name}</span>
                <span className="text-muted-foreground">·</span>
                <div className="flex gap-1">
                  {listing.availableForRent && (
                    <span className="text-[10px] font-semibold bg-primary/10 text-primary px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <Repeat className="h-2.5 w-2.5" /> Rent
                    </span>
                  )}
                  {listing.availableForSale && (
                    <span className="text-[10px] font-semibold bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <ShoppingBag className="h-2.5 w-2.5" /> Sell
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {listing.pricing?.rentPriceDaily && (
                  <span className="text-sm font-medium text-primary">{formatINR(listing.pricing.rentPriceDaily)}/day</span>
                )}
                {listing.pricing?.rentPriceDaily && listing.pricing?.buyPrice && <span className="text-muted-foreground text-xs">·</span>}
                {listing.pricing?.buyPrice && (
                  <span className="text-sm font-medium text-green-700">{formatINR(listing.pricing.buyPrice)} buy</span>
                )}
              </div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[listing.status] || 'bg-muted text-muted-foreground'}`}>
              {listing.status}
            </span>
            <div className="flex items-center gap-1">
              <Link href={`/items/${listing.id}`} className="p-2 hover:bg-accent rounded-lg" title="View">
                <Eye className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link href={`/vendor/listings/${listing.id}/edit`} className="p-2 hover:bg-accent rounded-lg" title="Edit">
                <Edit className="h-4 w-4 text-muted-foreground" />
              </Link>
              {listing.status === 'ACTIVE' && (
                <button onClick={() => updateStatus.mutate({ id: listing.id, status: 'PAUSED' })} className="p-2 hover:bg-accent rounded-lg" title="Pause">
                  <Pause className="h-4 w-4 text-yellow-600" />
                </button>
              )}
              {listing.status === 'PAUSED' && (
                <button onClick={() => updateStatus.mutate({ id: listing.id, status: 'ACTIVE' })} className="p-2 hover:bg-accent rounded-lg" title="Activate">
                  <Eye className="h-4 w-4 text-green-600" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
