'use client'

import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import {
  ShoppingCart, Star, MapPin, Shield, Heart, Share2, Clock,
  ArrowRight, CheckCircle2, CreditCard, Zap, Package,
  Calendar, Info, ChevronRight, BadgeCheck, MessageCircle,
  Repeat, ShoppingBag
} from 'lucide-react'
import { api } from '@/lib/api'
import { formatINR, formatDate } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const qc = useQueryClient()
  const [selectedImage, setSelectedImage] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [mode, setMode] = useState<'RENT' | 'BUY' | null>(null)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

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

  // Auto-set mode based on listing availability
  useEffect(() => {
    if (!listing || mode !== null) return
    if (listing.availableForRent) setMode('RENT')
    else if (listing.availableForSale) setMode('BUY')
  }, [listing, mode])

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

  // Compute rental days & costs
  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 0
    return Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
  }, [startDate, endDate])

  const costBreakdown = useMemo(() => {
    if (!listing?.pricing || rentalDays === 0) return null
    const { rentPriceDaily, rentPriceWeekly, rentPriceMonthly, securityDeposit } = listing.pricing

    // Smart pricing: use weekly/monthly rate if applicable
    let rentalCost = 0
    let rateLabel = ''
    if (rentalDays >= 28 && rentPriceMonthly) {
      const months = Math.floor(rentalDays / 30)
      const extraDays = rentalDays % 30
      rentalCost = (months * rentPriceMonthly) + (extraDays * rentPriceDaily)
      rateLabel = months > 0 && extraDays > 0
        ? `${months} month${months > 1 ? 's' : ''} + ${extraDays} day${extraDays > 1 ? 's' : ''}`
        : `${months} month${months > 1 ? 's' : ''}`
    } else if (rentalDays >= 7 && rentPriceWeekly) {
      const weeks = Math.floor(rentalDays / 7)
      const extraDays = rentalDays % 7
      rentalCost = (weeks * rentPriceWeekly) + (extraDays * rentPriceDaily)
      rateLabel = weeks > 0 && extraDays > 0
        ? `${weeks} week${weeks > 1 ? 's' : ''} + ${extraDays} day${extraDays > 1 ? 's' : ''}`
        : `${weeks} week${weeks > 1 ? 's' : ''}`
    } else {
      rentalCost = rentalDays * rentPriceDaily
      rateLabel = `${rentalDays} day${rentalDays > 1 ? 's' : ''}`
    }

    const platformFee = Math.round(rentalCost * 0.10)
    const total = rentalCost + (securityDeposit || 0) + platformFee

    return { rentalCost, securityDeposit: securityDeposit || 0, platformFee, total, rateLabel }
  }, [listing?.pricing, rentalDays])

  const addToCart = async (goToCheckout = false) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to continue')
      router.push('/login')
      return
    }
    if (mode === 'RENT' && (!startDate || !endDate)) {
      toast.error('Please select rental dates')
      return
    }

    setIsAddingToCart(true)
    try {
      await api.post('/cart/items', {
        listingId: id,
        mode,
        quantity: 1,
        startDate: mode === 'RENT' ? startDate : undefined,
        endDate: mode === 'RENT' ? endDate : undefined,
      })
      qc.invalidateQueries({ queryKey: ['cart'] })

      if (goToCheckout) {
        toast.success('Proceeding to checkout...')
        router.push('/checkout')
      } else {
        toast.success('Added to cart!')
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to add to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const todayStr = new Date().toISOString().split('T')[0]

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
  const datesSelected = mode === 'RENT' ? !!(startDate && endDate && rentalDays > 0) : true

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-1">
        <Link href="/" className="hover:text-primary transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/search?category=${category?.slug}`} className="hover:text-primary transition-colors">{category?.name}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium truncate max-w-[200px]">{listing.title}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8">
        {/* ── Left: Images ── */}
        <div>
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-accent relative group">
            {media?.[selectedImage]?.url ? (
              <Image src={media[selectedImage].url} alt={listing.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">No image available</div>
            )}
            {/* Condition badge on image */}
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full">
              {listing.condition.replace('_', ' ')}
            </span>
          </div>
          {media?.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {media.map((img: any, i: number) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === selectedImage ? 'border-primary' : 'border-transparent hover:border-primary/30'}`}
                >
                  <Image src={img.url} alt="" width={64} height={64} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}

          {/* Description - shown below image on desktop */}
          <div className="mt-8 hidden md:block">
            <h2 className="text-lg font-bold mb-3">About this item</h2>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{listing.description}</p>
            {listing.features?.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Features</h3>
                <ul className="grid grid-cols-2 gap-2">
                  {listing.features.map((f: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Details & Booking ── */}
        <div>
          {/* Category + Rating */}
          <div className="flex items-center gap-2 mb-2">
            <Link href={`/search?category=${category?.slug}`} className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium hover:bg-primary/20 transition-colors">
              {category?.name}
            </Link>
            {pricing?.averageRating > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold">{pricing.averageRating.toFixed(1)}</span>
                <span className="text-muted-foreground">({pricing.totalReviews})</span>
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold mb-4">{listing.title}</h1>

          {/* Mode selector — only when both options available */}
          {listing.availableForRent && listing.availableForSale && (
            <div className="flex rounded-xl border border-border overflow-hidden mb-4">
              <button
                onClick={() => setMode('RENT')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${
                  mode === 'RENT'
                    ? 'bg-primary text-white'
                    : 'bg-white hover:bg-accent text-muted-foreground'
                }`}
              >
                <Repeat className="h-4 w-4" /> Rent
              </button>
              <button
                onClick={() => setMode('BUY')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-colors ${
                  mode === 'BUY'
                    ? 'bg-green-600 text-white'
                    : 'bg-white hover:bg-accent text-muted-foreground'
                }`}
              >
                <ShoppingBag className="h-4 w-4" /> Buy
              </button>
            </div>
          )}

          {/* Single-mode label */}
          {listing.availableForRent && !listing.availableForSale && (
            <div className="flex items-center gap-1.5 mb-4">
              <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <Repeat className="h-3 w-3" /> Available for Rent
              </span>
            </div>
          )}
          {!listing.availableForRent && listing.availableForSale && (
            <div className="flex items-center gap-1.5 mb-4">
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                <ShoppingBag className="h-3 w-3" /> Available for Sale
              </span>
            </div>
          )}

          {/* ── Pricing Card ── */}
          <div className={`border rounded-xl p-5 mb-4 ${mode === 'BUY' ? 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200' : 'bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20'}`}>
            {mode === 'RENT' && pricing?.rentPriceDaily && (
              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Daily</p>
                  <p className="text-2xl font-bold text-primary">{formatINR(pricing.rentPriceDaily)}</p>
                </div>
                {pricing.rentPriceWeekly && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Weekly</p>
                    <p className="text-lg font-semibold">{formatINR(pricing.rentPriceWeekly)}</p>
                  </div>
                )}
                {pricing.rentPriceMonthly && (
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Monthly</p>
                    <p className="text-lg font-semibold">{formatINR(pricing.rentPriceMonthly)}</p>
                  </div>
                )}
              </div>
            )}
            {mode === 'BUY' && pricing?.buyPrice && (
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Buy Price</p>
                <p className="font-bold text-2xl text-green-700">{formatINR(pricing.buyPrice)}</p>
                <p className="text-sm text-muted-foreground mt-1">One-time purchase — item is yours to keep</p>
              </div>
            )}
            {mode === 'RENT' && pricing?.securityDeposit > 0 && (
              <div className="flex items-center gap-1.5 mt-3 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Security deposit: <strong className="text-foreground">{formatINR(pricing.securityDeposit)}</strong> (fully refundable)</span>
              </div>
            )}
          </div>

          {/* ── Date Picker for Rent ── */}
          {mode === 'RENT' && (
            <div className="border border-border rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">Select Rental Period</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    min={todayStr}
                    onChange={(e) => {
                      setStartDate(e.target.value)
                      if (endDate && e.target.value > endDate) setEndDate('')
                    }}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || todayStr}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                </div>
              </div>

              {/* ── Cost Breakdown ── */}
              {costBreakdown && (
                <div className="mt-4 bg-accent/50 rounded-lg p-3 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rental ({costBreakdown.rateLabel})</span>
                    <span className="font-medium">{formatINR(costBreakdown.rentalCost)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Security deposit</span>
                    <span className="font-medium">{formatINR(costBreakdown.securityDeposit)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform fee (10%)</span>
                    <span className="font-medium">{formatINR(costBreakdown.platformFee)}</span>
                  </div>
                  <div className="border-t border-border pt-1.5 flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-primary text-lg">{formatINR(costBreakdown.total)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Action Buttons ── */}
          <div className="space-y-3 mb-6">
            {/* Rent Now / Buy Now — primary CTA */}
            <button
              onClick={() => addToCart(true)}
              disabled={!datesSelected || isAddingToCart}
              className={`w-full py-3.5 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base transition-opacity ${
                mode === 'BUY' ? 'bg-green-600 text-white' : 'bg-primary text-white'
              }`}
            >
              {isAddingToCart ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'BUY' ? (
                <ShoppingBag className="h-5 w-5" />
              ) : (
                <Zap className="h-5 w-5" />
              )}
              {mode === 'RENT'
                ? (datesSelected ? `Rent Now ${costBreakdown ? `· ${formatINR(costBreakdown.total)}` : ''}` : 'Select dates to rent')
                : `Buy Now · ${pricing?.buyPrice ? formatINR(pricing.buyPrice) : ''}`}
            </button>

            {/* Add to Cart — secondary */}
            <div className="flex gap-3">
              <button
                onClick={() => addToCart(false)}
                disabled={!datesSelected || isAddingToCart}
                className={`flex-1 border py-3 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors ${
                  mode === 'BUY'
                    ? 'border-green-600 text-green-700 hover:bg-green-50'
                    : 'border-primary text-primary hover:bg-primary/5'
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => toggleSave.mutate()}
                  className={`px-4 py-3 rounded-xl border transition-colors ${isSaved ? 'border-red-200 bg-red-50 text-red-500' : 'border-border hover:bg-accent text-muted-foreground'}`}
                  title={isSaved ? 'Remove from saved' : 'Save item'}
                >
                  <Heart className={`h-5 w-5 ${isSaved ? 'fill-red-500' : ''}`} />
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
          </div>

          {/* ── Trust Badges ── */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="flex flex-col items-center text-center p-3 bg-accent/50 rounded-lg">
              <Shield className="h-5 w-5 text-green-600 mb-1" />
              <span className="text-xs font-medium">Secure Payment</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 bg-accent/50 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-blue-600 mb-1" />
              <span className="text-xs font-medium">Verified Item</span>
            </div>
            <div className="flex flex-col items-center text-center p-3 bg-accent/50 rounded-lg">
              <CreditCard className="h-5 w-5 text-purple-600 mb-1" />
              <span className="text-xs font-medium">Deposit Refund</span>
            </div>
          </div>

          {/* ── Vendor Card (Enhanced) ── */}
          <div className="border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">About the Vendor</h3>
              {vendor?.vendorProfile?.status === 'APPROVED' && (
                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <BadgeCheck className="h-3 w-3" /> Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                {vendor?.name?.[0] || 'V'}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{vendor?.name}</p>
                {vendor?.vendorProfile?.location?.city && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{vendor.vendorProfile.location.city}{vendor.vendorProfile.location.state ? `, ${vendor.vendorProfile.location.state}` : ''}</span>
                  </div>
                )}
                {vendor?.vendorProfile?.businessName && (
                  <p className="text-xs text-muted-foreground mt-0.5">{vendor.vendorProfile.businessName}</p>
                )}
              </div>
            </div>
            {vendor?.vendorProfile?.metrics && (
              <div className="flex gap-4 mt-3 pt-3 border-t border-border">
                <div className="text-center">
                  <p className="font-semibold text-sm">{vendor.vendorProfile.metrics.totalListings || 0}</p>
                  <p className="text-xs text-muted-foreground">Listings</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm">{vendor.vendorProfile.metrics.totalOrders || 0}</p>
                  <p className="text-xs text-muted-foreground">Orders</p>
                </div>
                {vendor.vendorProfile.metrics.averageRating > 0 && (
                  <div className="text-center">
                    <p className="font-semibold text-sm flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {vendor.vendorProfile.metrics.averageRating.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Rental Policy ── */}
          <div className="mt-4 space-y-2">
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Free cancellation up to 24 hours before pickup</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Pickup from vendor location in {vendor?.vendorProfile?.location?.city || 'your city'}</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Security deposit refunded within 48 hours after return</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Description (mobile only) ── */}
      <div className="mt-8 md:hidden">
        <h2 className="text-lg font-bold mb-3">About this item</h2>
        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{listing.description}</p>
        {listing.features?.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Features</h3>
            <ul className="space-y-2">
              {listing.features.map((f: string, i: number) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* ── Reviews ── */}
      {reviews?.length > 0 && (
        <div className="mt-8 border-t border-border pt-8">
          <h2 className="text-xl font-bold mb-4">Reviews ({reviews.length})</h2>
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
            <Link href={`/search?category=${category?.slug}`} className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedItems.map((item: any) => (
              <Link key={item.id} href={`/items/${item.id}`} className="group">
                <div className="aspect-[4/3] bg-accent rounded-xl overflow-hidden mb-2 relative">
                  {item.media?.[0]?.url ? (
                    <Image src={item.media[0].url} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 50vw, 25vw" />
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
