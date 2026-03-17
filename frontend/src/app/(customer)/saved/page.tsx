'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, PackageOpen } from 'lucide-react'
import { formatINR } from '@/lib/utils'

interface SavedItem {
  id: string
  listingId: string
  createdAt: string
  listing: {
    id: string
    title: string
    condition: string
    mode: string
    media: { url: string | null; r2Key: string }[]
    pricing: {
      rentPriceDaily: number | null
      rentPriceWeekly: number | null
      buyPrice: number | null
    } | null
  }
}

export default function SavedItemsPage() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['saved-items'],
    queryFn: () => api.get('/saved').then(r => r.data as { items: SavedItem[]; total: number }),
  })

  const removeItem = useMutation({
    mutationFn: (listingId: string) => api.delete(`/saved/${listingId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['saved-items'] }),
  })

  const items = data?.items ?? []

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Saved Items</h1>
        <p className="text-sm text-muted-foreground">{data?.total ?? 0} items</p>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <PackageOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No saved items yet</p>
          <p className="text-sm mt-1">Heart items you like to save them here</p>
          <Link href="/search">
            <Button variant="outline" className="mt-4">Browse Items</Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map(({ listing, listingId, id }) => {
          const img = listing.media[0]?.url
          const price = listing.pricing?.rentPriceDaily
            ? `₹${listing.pricing.rentPriceDaily}/day`
            : listing.pricing?.buyPrice
              ? formatINR(listing.pricing.buyPrice)
              : null

          return (
            <div key={id} className="group relative border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              <Link href={`/items/${listing.id}`}>
                <div className="aspect-square relative bg-muted">
                  {img ? (
                    <Image src={img} alt={listing.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="font-medium text-sm line-clamp-2">{listing.title}</p>
                  {price && <p className="text-sm text-primary font-semibold mt-1">{price}</p>}
                  <Badge variant="secondary" className="mt-1 text-xs">{listing.condition}</Badge>
                </div>
              </Link>
              <button
                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow hover:bg-red-50 transition-colors"
                onClick={() => removeItem.mutate(listingId)}
                disabled={removeItem.isPending}
              >
                <Heart className="h-4 w-4 fill-red-500 text-red-500" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
