'use client'

import { useState, Suspense, lazy } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { SlidersHorizontal, LayoutGrid, Map, X, SearchX, ArrowRight, Star, Repeat, ShoppingBag } from 'lucide-react'
import { api } from '@/lib/api'
import { formatINR } from '@/lib/utils'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer'

const ListingsMap = lazy(() => import('@/components/maps/ListingsMap'))

const CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'HEAVY_USE']
const CONDITIONS_LABEL: Record<string, string> = {
  NEW: 'New',
  LIKE_NEW: 'Like New',
  GOOD: 'Good',
  FAIR: 'Fair',
  HEAVY_USE: 'Heavy Use',
}

const CATEGORY_SLUGS = [
  { name: 'Cameras', slug: 'cameras' },
  { name: 'Bikes', slug: 'bikes' },
  { name: 'Tools', slug: 'tools' },
  { name: 'Furniture', slug: 'furniture' },
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Instruments', slug: 'instruments' },
]

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <SearchPageContent />
    </Suspense>
  )
}

function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showFilters, setShowFilters] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')

  const q = searchParams.get('q') || ''
  const categorySlug = searchParams.get('categorySlug') || ''
  const categoryId = searchParams.get('categoryId') || ''
  const priceMin = searchParams.get('priceMin') || ''
  const priceMax = searchParams.get('priceMax') || ''
  const condition = searchParams.get('condition') || ''
  const mode = searchParams.get('mode') || ''
  const sortBy = searchParams.get('sortBy') || ''
  const page = parseInt(searchParams.get('page') || '1')

  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (categorySlug) params.set('categorySlug', categorySlug)
  if (categoryId) params.set('categoryId', categoryId)
  if (priceMin) params.set('priceMin', priceMin)
  if (priceMax) params.set('priceMax', priceMax)
  if (condition) params.set('condition', condition)
  if (mode) params.set('mode', mode)
  if (sortBy) params.set('sortBy', sortBy)
  params.set('page', String(page))
  params.set('limit', '20')

  const { data, isLoading } = useQuery({
    queryKey: ['listings', params.toString()],
    queryFn: () => api.get(`/listings?${params}`).then(r => r.data),
  })

  const setFilter = (key: string, value: string) => {
    const p = new URLSearchParams(searchParams.toString())
    if (value) p.set(key, value)
    else p.delete(key)
    p.delete('page')
    router.push(`/search?${p}`)
  }

  const clearAllFilters = () => {
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    router.push(`/search?${p}`)
  }

  // Count active filters (excluding q and page)
  const activeFilterCount = [mode, priceMin, priceMax, condition, categorySlug, categoryId, sortBy]
    .filter(Boolean).length

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* ── Single toolbar row: category pills + Filters button ── */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {/* Category pills */}
        <button
          onClick={() => setFilter('categorySlug', '')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
            !categorySlug ? 'bg-primary text-white' : 'border border-border hover:border-primary/40 hover:text-primary'
          }`}
        >
          All
        </button>
        {CATEGORY_SLUGS.map(({ name, slug }) => (
          <button
            key={slug}
            onClick={() => setFilter('categorySlug', slug === categorySlug ? '' : slug)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
              categorySlug === slug
                ? 'bg-primary text-white'
                : 'border border-border hover:border-primary/40 hover:text-primary'
            }`}
          >
            {name}
          </button>
        ))}

        {/* Divider */}
        <div className="w-px h-5 bg-border flex-shrink-0 mx-1" />

        {/* Filters button — mobile: opens drawer, desktop: toggles sidebar */}
        <button
          type="button"
          onClick={() => {
            // On mobile open drawer, on desktop toggle sidebar
            if (window.innerWidth < 640) setMobileFiltersOpen(true)
            else setShowFilters(!showFilters)
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-colors flex-shrink-0 ml-auto min-h-[36px] ${
            showFilters || activeFilterCount > 0
              ? 'border-primary text-primary bg-primary/5'
              : 'border-border hover:bg-accent'
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-semibold leading-none">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-6">

        {/* ── Filters Sidebar (desktop only) ── */}
        {showFilters && (
          <aside className="w-60 flex-shrink-0 hidden sm:block">
            <div className="bg-white border border-border rounded-xl p-4 space-y-5 sticky top-36">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">Filters</h3>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-destructive hover:underline flex items-center gap-1"
                  >
                    <X className="h-3 w-3" /> Clear all
                  </button>
                )}
              </div>

              {/* Mode */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Listing Type</p>
                <div className="space-y-1.5">
                  {[
                    { val: 'RENT', label: 'For Rent' },
                    { val: 'BUY', label: 'For Sale' },
                  ].map(({ val, label }) => (
                    <label key={val} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="mode"
                        checked={mode === val}
                        onChange={() => setFilter('mode', val === mode ? '' : val)}
                        className="accent-primary h-3.5 w-3.5"
                      />
                      <span className="text-sm group-hover:text-primary transition-colors">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Price (₹/day)</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    defaultValue={priceMin}
                    onBlur={(e) => setFilter('priceMin', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    defaultValue={priceMax}
                    onBlur={(e) => setFilter('priceMax', e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Condition */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Condition</p>
                <div className="space-y-1.5">
                  {CONDITIONS.map(c => (
                    <label key={c} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name="condition"
                        checked={condition === c}
                        onChange={() => setFilter('condition', c === condition ? '' : c)}
                        className="accent-primary h-3.5 w-3.5"
                      />
                      <span className="text-sm group-hover:text-primary transition-colors">{CONDITIONS_LABEL[c]}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        )}

        {/* ── Results ── */}
        <div className="flex-1 min-w-0">

          {/* Result count + sort + view toggle */}
          <div className="flex items-center justify-between mb-4 gap-3">
            <p className="text-sm text-muted-foreground flex-shrink-0">
              {isLoading ? (
                <span className="animate-pulse">Searching…</span>
              ) : (
                <>
                  <span className="font-semibold text-foreground">{data?.total || 0}</span> items found
                  {q && <> for &ldquo;<span className="font-medium text-foreground">{q}</span>&rdquo;</>}
                  {categorySlug && <> in <span className="font-medium text-foreground capitalize">{categorySlug}</span></>}
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              {/* Sort dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setFilter('sortBy', e.target.value)}
                className="text-xs border border-border rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="">Relevance</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="rating">Top Rated</option>
              </select>
              {/* View toggle */}
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'hover:bg-accent'}`}
                  title="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 transition-colors ${viewMode === 'map' ? 'bg-primary text-white' : 'hover:bg-accent'}`}
                  title="Map view"
                >
                  <Map className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Map view */}
          {viewMode === 'map' && !isLoading && (
            <div className="rounded-xl overflow-hidden mb-6 border border-border">
              <Suspense fallback={<div className="h-[500px] bg-muted animate-pulse rounded-xl" />}>
                <ListingsMap listings={data?.listings ?? []} />
              </Suspense>
            </div>
          )}

          {/* Loading skeletons */}
          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-muted rounded-xl mb-3" />
                  <div className="h-3.5 bg-muted rounded mb-2" />
                  <div className="h-3.5 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && (data?.listings?.length ?? 0) === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                <SearchX className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">No items found</h3>
              <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
                {q
                  ? `We couldn't find any results for "${q}". Try different keywords or browse by category.`
                  : 'No items match your current filters. Try adjusting or clearing them.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="border border-border px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-accent transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
                <Link
                  href="/search"
                  className="bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                >
                  Browse All Items <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Grid */}
          {!isLoading && (data?.listings?.length ?? 0) > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {data?.listings?.map((listing: any) => {
                const canRent = listing.availableForRent && listing.pricing?.rentPriceDaily
                const canBuy = listing.availableForSale && listing.pricing?.buyPrice
                return (
                <Link key={listing.id} href={`/items/${listing.id}`} className="group">
                  <div className="aspect-[4/3] bg-accent rounded-xl overflow-hidden mb-3 relative">
                    {listing.media?.[0] ? (
                      <Image
                        src={listing.media[0].url || '/placeholder.jpg'}
                        alt={listing.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        No image
                      </div>
                    )}
                    {/* Condition badge */}
                    <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-xs px-2 py-0.5 rounded-full font-medium">
                      {CONDITIONS_LABEL[listing.condition] || listing.condition}
                    </span>
                    {/* Rating badge */}
                    {listing.pricing?.averageRating > 0 && (
                      <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {listing.pricing.averageRating.toFixed(1)}
                      </span>
                    )}
                    {/* Rent/Buy badges at bottom of image */}
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      {canRent && (
                        <span className="bg-primary/90 backdrop-blur-sm text-white text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <Repeat className="h-2.5 w-2.5" /> Rent
                        </span>
                      )}
                      {canBuy && (
                        <span className="bg-green-600/90 backdrop-blur-sm text-white text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                          <ShoppingBag className="h-2.5 w-2.5" /> Buy
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                    {listing.title}
                  </h3>
                  {/* Price display */}
                  <div className="flex items-baseline gap-2 flex-wrap">
                    {canRent && (
                      <p className="text-primary font-semibold text-sm">
                        {formatINR(listing.pricing.rentPriceDaily)}<span className="text-muted-foreground font-normal">/day</span>
                      </p>
                    )}
                    {canRent && canBuy && <span className="text-muted-foreground text-xs">·</span>}
                    {canBuy && (
                      <p className="text-green-700 font-semibold text-sm">
                        {formatINR(listing.pricing.buyPrice)}<span className="text-muted-foreground font-normal text-xs"> buy</span>
                      </p>
                    )}
                  </div>
                </Link>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {(data?.total ?? 0) > 20 && (
            <div className="flex justify-center gap-2 mt-8">
              {page > 1 && (
                <button
                  onClick={() => setFilter('page', String(page - 1))}
                  className="px-4 py-2 border border-border rounded-xl hover:bg-accent text-sm font-medium transition-colors"
                >
                  ← Previous
                </button>
              )}
              {page * 20 < (data?.total ?? 0) && (
                <button
                  onClick={() => setFilter('page', String(page + 1))}
                  className="px-4 py-2 border border-border rounded-xl hover:bg-accent text-sm font-medium transition-colors"
                >
                  Next →
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      <Drawer open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <DrawerContent>
          <DrawerHeader>
            <div className="flex items-center justify-between">
              <DrawerTitle>Filters</DrawerTitle>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-destructive hover:underline flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> Clear all
                </button>
              )}
            </div>
          </DrawerHeader>

          <div className="px-4 py-4 overflow-y-auto space-y-6">
            {/* Mode */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Listing Type</p>
              <div className="space-y-1">
                {[
                  { val: 'RENT', label: 'For Rent' },
                  { val: 'BUY', label: 'For Sale' },
                ].map(({ val, label }) => (
                  <label key={val} className="flex items-center gap-3 cursor-pointer min-h-[44px] px-2 rounded-lg hover:bg-accent transition-colors">
                    <input
                      type="radio"
                      name="mode-m"
                      checked={mode === val}
                      onChange={() => setFilter('mode', val === mode ? '' : val)}
                      className="accent-primary h-4 w-4"
                    />
                    <span className="text-sm">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Price (₹/day)</p>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="Min"
                  defaultValue={priceMin}
                  onBlur={(e) => setFilter('priceMin', e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                />
                <input
                  type="number"
                  placeholder="Max"
                  defaultValue={priceMax}
                  onBlur={(e) => setFilter('priceMax', e.target.value)}
                  className="w-full px-3 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
                />
              </div>
            </div>

            {/* Condition */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Condition</p>
              <div className="space-y-1">
                {CONDITIONS.map(c => (
                  <label key={c} className="flex items-center gap-3 cursor-pointer min-h-[44px] px-2 rounded-lg hover:bg-accent transition-colors">
                    <input
                      type="radio"
                      name="condition-m"
                      checked={condition === c}
                      onChange={() => setFilter('condition', c === condition ? '' : c)}
                      className="accent-primary h-4 w-4"
                    />
                    <span className="text-sm">{CONDITIONS_LABEL[c]}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <DrawerFooter>
            <button
              onClick={() => setMobileFiltersOpen(false)}
              className="w-full bg-primary text-white py-3 rounded-xl font-semibold text-sm min-h-[48px]"
            >
              Show {data?.total || 0} results
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
