'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { api } from '@/lib/api'
import { formatINR } from '@/lib/utils'

const CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'HEAVY_USE']
const CONDITIONS_LABEL: Record<string, string> = {
  NEW: 'New', LIKE_NEW: 'Like New', GOOD: 'Good', FAIR: 'Fair', HEAVY_USE: 'Heavy Use',
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showFilters, setShowFilters] = useState(false)

  const q = searchParams.get('q') || ''
  const categoryId = searchParams.get('categoryId') || ''
  const priceMin = searchParams.get('priceMin') || ''
  const priceMax = searchParams.get('priceMax') || ''
  const condition = searchParams.get('condition') || ''
  const mode = searchParams.get('mode') || ''
  const page = parseInt(searchParams.get('page') || '1')

  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (categoryId) params.set('categoryId', categoryId)
  if (priceMin) params.set('priceMin', priceMin)
  if (priceMax) params.set('priceMax', priceMax)
  if (condition) params.set('condition', condition)
  if (mode) params.set('mode', mode)
  params.set('page', String(page))
  params.set('limit', '20')

  const { data, isLoading } = useQuery({
    queryKey: ['listings', params.toString()],
    queryFn: () => api.get(`/listings?${params}`).then(r => r.data),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data),
  })

  const setFilter = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString())
    if (value) p.set(key, value)
    else p.delete(key)
    p.delete('page')
    router.push(`/search?${p}`)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search bar */}
      <div className="mb-6">
        <form onSubmit={(e) => { e.preventDefault(); const f = e.target as any; setFilter('q', f.q.value) }} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input name="q" defaultValue={q} placeholder="Search items..." className="w-full pl-9 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <button type="submit" className="bg-primary text-white px-4 py-2 rounded-lg font-medium">Search</button>
          <button type="button" onClick={() => setShowFilters(!showFilters)} className="border border-border px-3 py-2 rounded-lg hover:bg-accent flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
        </form>
      </div>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        {showFilters && (
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white border border-border rounded-xl p-4 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Filters</h3>
                <button onClick={() => router.push('/search')} className="text-xs text-muted-foreground hover:underline">Clear all</button>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Mode</p>
                {['RENT', 'BUY'].map(m => (
                  <label key={m} className="flex items-center gap-2 mb-1 cursor-pointer">
                    <input type="radio" name="mode" checked={mode === m} onChange={() => setFilter('mode', m === mode ? '' : m)} className="accent-primary" />
                    <span className="text-sm">{m === 'RENT' ? 'For Rent' : 'For Sale'}</span>
                  </label>
                ))}
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Price Range (₹/day)</p>
                <div className="flex gap-2">
                  <input type="number" placeholder="Min" defaultValue={priceMin} onBlur={(e) => setFilter('priceMin', e.target.value)} className="w-full px-2 py-1 border border-border rounded text-sm" />
                  <input type="number" placeholder="Max" defaultValue={priceMax} onBlur={(e) => setFilter('priceMax', e.target.value)} className="w-full px-2 py-1 border border-border rounded text-sm" />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Condition</p>
                {CONDITIONS.map(c => (
                  <label key={c} className="flex items-center gap-2 mb-1 cursor-pointer">
                    <input type="radio" name="condition" checked={condition === c} onChange={() => setFilter('condition', c === condition ? '' : c)} className="accent-primary" />
                    <span className="text-sm">{CONDITIONS_LABEL[c]}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Results */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {isLoading ? 'Searching...' : `${data?.total || 0} items found`}
              {q && ` for "${q}"`}
            </p>
          </div>

          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200 rounded-xl mb-3" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && data?.listings?.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No items found. Try different search terms or filters.</p>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data?.listings?.map((listing: any) => (
              <Link key={listing.id} href={`/items/${listing.id}`} className="group">
                <div className="aspect-[4/3] bg-accent rounded-xl overflow-hidden mb-3 relative">
                  {listing.media?.[0] ? (
                    <Image src={listing.media[0].url || '/placeholder.jpg'} alt={listing.title} fill className="object-cover group-hover:scale-105 transition" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
                  )}
                  <span className="absolute top-2 left-2 bg-white/90 text-xs px-2 py-0.5 rounded-full font-medium">
                    {CONDITIONS_LABEL[listing.condition] || listing.condition}
                  </span>
                </div>
                <h3 className="font-medium text-sm line-clamp-2 mb-1">{listing.title}</h3>
                {listing.pricing?.averageRating > 0 && (
                  <span className="text-xs text-amber-500">★ {listing.pricing.averageRating.toFixed(1)} ({listing.pricing.totalReviews})</span>
                )}
                {listing.pricing?.rentPriceDaily && (
                  <p className="text-primary font-semibold text-sm mt-1">{formatINR(listing.pricing.rentPriceDaily)}/day</p>
                )}
                {listing.pricing?.buyPrice && !listing.pricing?.rentPriceDaily && (
                  <p className="text-primary font-semibold text-sm mt-1">Buy: {formatINR(listing.pricing.buyPrice)}</p>
                )}
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {data?.total > 20 && (
            <div className="flex justify-center gap-2 mt-8">
              {page > 1 && (
                <button onClick={() => setFilter('page', String(page - 1))} className="px-4 py-2 border border-border rounded-lg hover:bg-accent text-sm">Previous</button>
              )}
              {page * 20 < data.total && (
                <button onClick={() => setFilter('page', String(page + 1))} className="px-4 py-2 border border-border rounded-lg hover:bg-accent text-sm">Next</button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
