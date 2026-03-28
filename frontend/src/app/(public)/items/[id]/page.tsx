'use client'

import { useParams } from 'next/navigation'
import Image from 'next/image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Star, MapPin, Shield, Heart, Share2, Clock, ArrowRight } from 'lucide-react'
import { api } from '@/lib/api'
import { formatINR, formatDate } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated } = useAuth()
  const qc = useQueryClient()
  const [selectedImage, setSelectedImage] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [mode, setMode] = useState<'RENT' | 'BUY'>('RENT')

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => api.get(`/listings/${id}`).then(r => r.data),
  })

  const { data: savedData } = useQuery({
    queryKey: ['saved-check', id],
    queryFn: () => api.get(`/saved/${id}/check`).then(r => r.data as { saved: boolean }),
    enabled: isAuthenticated,
  })
  const isSaved = savedData?.saved ?? false

  const toggleSave = useMutation({
    mutationFn: () => isSaved ? api.delete(`/saved/${id}`) : api.post(`/saved/${id}`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['saved-check', id] })
      qc.invalidateQueries({ queryKey: ['saved-items'] })
      toast.success(isSaved ? 'Removed from saved' : 'Saved!')
    },
  })

  // Related items query (same category)
  const { data: relatedData } = useQuery({
    queryKey: ['related-items', listing?.categoryId],
    queryFn: () => api.get(`/listings?categoryId=${listing?.categoryId}&limit=4`).then(r => r.data),
    enabled: !!listing?.categoryId,
  })
  const relatedItems = (relatedData?.listings || []).filter((l: any) => l.id !== id).slice(0, 4)

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: listing?.title, url })
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    }
  }

  const addToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart')
      return
    }
    try {
      await api.post('/cart/items', {
        listingId: id,
        mode,
        quantity: 1,
        startDate: mode === 'RENT' ? startDate : undefined,
        endDate: mode === 'RENT' ? endDate : undefined,
      })
      toast.success('Added to cart!')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to add to cart')
    }
  }

  if (isLoading) return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 animate-pulse">
        <div className="aspect-[4/3] bg-muted rounded-2xl" />
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-6 bg-muted rounded w-1/2" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    </div>
  )

  if (!listing) return <div className="max-w-6xl mx-auto px-4 py-8 text-center text-muted-foreground">Item not found</div>

  const { pricing, media, vendor, reviews, category } = listing
  const rentalDays = startDate && endDate
    ? Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0
  const totalCost = mode === 'RENT' ? (pricing?.rentPriceDaily || 0) * rentalDays : (pricing?.buyPrice || 0)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:underline">Home</Link>
        {' / '}
        <Link href={`/search?categoryId=${listing.categoryId}`} className="hover:underline">{category?.name}</Link>
        {' / '}
        <span>{listing.title}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-accent mb-3 relative">
            {media?.[selectedImage]?.url ? (
              <Image src={media[selectedImage].url} alt={listing.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image</div>
            )}
          </div>
          {media?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {media.map((img: any, i: number) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${i === selectedImage ? 'border-primary' : 'border-transparent'}`}
                >
                  <Image src={img.url} alt="" width={64} height={64} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start justify-between mb-2">
            <span className="text-sm bg-accent px-3 py-1 rounded-full font-medium">{category?.name}</span>
            <span className="text-sm text-muted-foreground">{listing.condition.replace('_', ' ')}</span>
          </div>

          <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>

          {pricing?.averageRating > 0 && (
            <div className="flex items-center gap-1 mb-4">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{pricing.averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground text-sm">({pricing.totalReviews} reviews)</span>
            </div>
          )}

          {/* Mode selector */}
          {listing.availableForRent && listing.availableForSale && (
            <div className="flex gap-2 mb-4">
              <button onClick={() => setMode('RENT')} className={`px-4 py-2 rounded-lg text-sm font-medium border ${mode === 'RENT' ? 'bg-primary text-white border-primary' : 'border-border hover:bg-accent'}`}>For Rent</button>
              <button onClick={() => setMode('BUY')} className={`px-4 py-2 rounded-lg text-sm font-medium border ${mode === 'BUY' ? 'bg-primary text-white border-primary' : 'border-border hover:bg-accent'}`}>Buy</button>
            </div>
          )}

          {/* Pricing */}
          <div className="bg-accent rounded-xl p-4 mb-4">
            {mode === 'RENT' && pricing?.rentPriceDaily && (
              <div className="flex gap-4">
                <div><p className="text-xs text-muted-foreground">Daily</p><p className="font-semibold">{formatINR(pricing.rentPriceDaily)}</p></div>
                {pricing.rentPriceWeekly && <div><p className="text-xs text-muted-foreground">Weekly</p><p className="font-semibold">{formatINR(pricing.rentPriceWeekly)}</p></div>}
                {pricing.rentPriceMonthly && <div><p className="text-xs text-muted-foreground">Monthly</p><p className="font-semibold">{formatINR(pricing.rentPriceMonthly)}</p></div>}
              </div>
            )}
            {mode === 'BUY' && pricing?.buyPrice && (
              <p className="font-bold text-xl">{formatINR(pricing.buyPrice)}</p>
            )}
            {pricing?.securityDeposit > 0 && (
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Security deposit: {formatINR(pricing.securityDeposit)} (refundable)</span>
              </div>
            )}
          </div>

          {/* Date picker for rent */}
          {mode === 'RENT' && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs font-medium block mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium block mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {rentalDays > 0 && (
                <p className="col-span-2 text-sm text-muted-foreground">
                  {rentalDays} day{rentalDays > 1 ? 's' : ''} → Total: <span className="font-semibold text-foreground">{formatINR(totalCost)}</span>
                </p>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={addToCart}
              disabled={mode === 'RENT' && (!startDate || !endDate)}
              className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              {mode === 'RENT' ? 'Add to Cart' : 'Buy Now'}
            </button>
            {isAuthenticated && (
              <button
                onClick={() => toggleSave.mutate()}
                className="px-4 py-3 rounded-xl border border-border hover:bg-accent transition-colors"
                title={isSaved ? 'Remove from saved' : 'Save item'}
              >
                <Heart className={`h-5 w-5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
              </button>
            )}
            <button
              onClick={handleShare}
              className="px-4 py-3 rounded-xl border border-border hover:bg-accent transition-colors"
              title="Share this item"
            >
              <Share2 className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          {/* Vendor card */}
          <div className="mt-6 border border-border rounded-xl p-4">
            <h3 className="font-semibold mb-2">About the Vendor</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                {vendor?.name?.[0] || 'V'}
              </div>
              <div>
                <p className="font-medium text-sm">{vendor?.name}</p>
                {vendor?.vendorProfile?.location?.city && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{vendor.vendorProfile.location.city}{vendor.vendorProfile.location.state ? `, ${vendor.vendorProfile.location.state}` : ''}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-3">About this item</h2>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{listing.description}</p>

        {listing.features?.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Features</h3>
            <ul className="list-disc list-inside space-y-1">
              {listing.features.map((f: string, i: number) => (
                <li key={i} className="text-sm text-muted-foreground">{f}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Reviews */}
      {reviews?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Reviews</h2>
          <div className="space-y-4">
            {reviews.map((review: any) => (
              <div key={review.id} className="border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-sm font-bold">
                      {review.user?.name?.[0]}
                    </div>
                    <span className="font-medium text-sm">{review.user?.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{review.comment}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDate(review.createdAt)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Related Items ── */}
      {relatedItems.length > 0 && (
        <div className="mt-12 border-t border-border pt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Similar Items</h2>
            <Link href={`/search?categoryId=${listing.categoryId}`} className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedItems.map((item: any) => (
              <Link key={item.id} href={`/items/${item.id}`} className="group">
                <div className="aspect-[4/3] bg-accent rounded-xl overflow-hidden mb-2 relative">
                  {item.media?.[0]?.url ? (
                    <Image src={item.media[0].url} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
                  )}
                </div>
                <h3 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">{item.title}</h3>
                {item.pricing?.rentPriceDaily && (
                  <p className="text-primary font-semibold text-sm">
                    {formatINR(item.pricing.rentPriceDaily)}<span className="text-muted-foreground font-normal">/day</span>
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
