'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, Repeat, ShoppingBag, ArrowLeftRight, Info, IndianRupee, Loader2, ImagePlus } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { ImageUpload } from '@/components/upload/ImageUpload'

const schema = z.object({
  categoryId: z.string().uuid('Select a category'),
  title: z.string().min(5, 'Min 5 characters').max(100),
  description: z.string().min(20, 'Min 20 characters').max(2000),
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'HEAVY_USE']),
  availableForRent: z.boolean(),
  availableForSale: z.boolean(),
  quantity: z.coerce.number().int().min(1).max(100),
  rentPriceDaily: z.coerce.number().positive().optional().or(z.literal('')),
  rentPriceWeekly: z.coerce.number().positive().optional().or(z.literal('')),
  rentPriceMonthly: z.coerce.number().positive().optional().or(z.literal('')),
  buyPrice: z.coerce.number().positive().optional().or(z.literal('')),
  securityDeposit: z.coerce.number().min(0).default(0),
})

type FormData = z.infer<typeof schema>

const CONDITIONS = [
  { value: 'NEW', label: 'Brand New', desc: 'Unused, sealed packaging' },
  { value: 'LIKE_NEW', label: 'Like New', desc: 'Barely used, no visible wear' },
  { value: 'GOOD', label: 'Good', desc: 'Minor wear, fully functional' },
  { value: 'FAIR', label: 'Fair', desc: 'Visible wear, works well' },
  { value: 'HEAVY_USE', label: 'Well Used', desc: 'Heavy wear, functional' },
]

type ListingType = 'RENT' | 'SELL' | 'BOTH'

export default function NewListingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [listingType, setListingType] = useState<ListingType>('RENT')
  const [images, setImages] = useState<{ publicId: string; url: string }[]>([])

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data),
  })

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { availableForRent: true, availableForSale: false, quantity: 1, securityDeposit: 0 },
  })

  const watchedDailyRate = watch('rentPriceDaily')

  // Sync listing type with form values
  const handleTypeChange = (type: ListingType) => {
    setListingType(type)
    setValue('availableForRent', type === 'RENT' || type === 'BOTH')
    setValue('availableForSale', type === 'SELL' || type === 'BOTH')
  }

  // Auto-suggest weekly/monthly rates
  const suggestWeeklyRate = () => {
    const daily = Number(watchedDailyRate)
    if (daily > 0) setValue('rentPriceWeekly', Math.round(daily * 5.5) as any)
  }
  const suggestMonthlyRate = () => {
    const daily = Number(watchedDailyRate)
    if (daily > 0) setValue('rentPriceMonthly', Math.round(daily * 18) as any)
  }

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        ...data,
        rentPriceDaily: data.rentPriceDaily || undefined,
        rentPriceWeekly: data.rentPriceWeekly || undefined,
        rentPriceMonthly: data.rentPriceMonthly || undefined,
        buyPrice: data.buyPrice || undefined,
      }
      const res = await api.post('/vendor/listings', payload)
      const listingId = res.data.id

      if (images.length > 0) {
        await api.post(`/vendor/listings/${listingId}/images`, {
          images: images.map((img, i) => ({ r2Key: img.publicId, isPrimary: i === 0 })),
        })
      }

      toast.success('Listing created successfully!')
      router.push('/vendor/listings')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to create listing')
    }
  }

  const totalSteps = 4

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/vendor/listings" className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Create New Listing</h1>
          <p className="text-sm text-muted-foreground">Step {step} of {totalSteps}</p>
        </div>
      </div>

      {/* Progress bar with labels */}
      <div className="flex gap-1.5 mb-8">
        {['Type', 'Details', 'Price', 'Photos'].map((label, i) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-1">
            <div className={`w-full h-1.5 rounded-full transition-colors ${i < step ? 'bg-primary' : 'bg-muted'}`} />
            <span className={`text-[10px] font-medium ${i < step ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* ── Step 1: Listing Type ── */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">How do you want to list this item?</h2>
              <p className="text-sm text-muted-foreground">Choose how customers can get your item</p>
            </div>

            <div className="grid gap-3">
              {/* Rent option */}
              <button
                type="button"
                onClick={() => handleTypeChange('RENT')}
                className={`text-left p-5 rounded-xl border-2 transition-all ${
                  listingType === 'RENT'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${listingType === 'RENT' ? 'bg-primary text-white' : 'bg-accent text-muted-foreground'}`}>
                    <Repeat className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-0.5">For Rent</h3>
                    <p className="text-sm text-muted-foreground">Customers rent your item for a period and return it. You earn recurring income.</p>
                  </div>
                </div>
              </button>

              {/* Sell option */}
              <button
                type="button"
                onClick={() => handleTypeChange('SELL')}
                className={`text-left p-5 rounded-xl border-2 transition-all ${
                  listingType === 'SELL'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${listingType === 'SELL' ? 'bg-primary text-white' : 'bg-accent text-muted-foreground'}`}>
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-0.5">For Sale</h3>
                    <p className="text-sm text-muted-foreground">Sell your item outright. One-time transaction, ownership transfers to buyer.</p>
                  </div>
                </div>
              </button>

              {/* Both option */}
              <button
                type="button"
                onClick={() => handleTypeChange('BOTH')}
                className={`text-left p-5 rounded-xl border-2 transition-all ${
                  listingType === 'BOTH'
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${listingType === 'BOTH' ? 'bg-primary text-white' : 'bg-accent text-muted-foreground'}`}>
                    <ArrowLeftRight className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-0.5">Rent & Sell</h3>
                    <p className="text-sm text-muted-foreground">Let customers choose — rent it or buy it. Maximize your reach and earnings.</p>
                  </div>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:opacity-90 flex items-center justify-center gap-2"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── Step 2: Item Details ── */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Item Details</h2>
              <p className="text-sm text-muted-foreground">Tell us about your item</p>
            </div>

            <div className="bg-white border border-border rounded-xl p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category *</label>
                <select {...register('categoryId')} className="w-full px-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                  <option value="">Select a category</option>
                  {categories?.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
                </select>
                {errors.categoryId && <p className="text-destructive text-xs mt-1">{errors.categoryId.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input {...register('title')} placeholder="e.g. Canon EOS 5D Mark IV with 24-70mm Lens" className="w-full px-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message}</p>}
                <p className="text-xs text-muted-foreground mt-1">Be specific — include brand, model, and key specs</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea {...register('description')} rows={5} placeholder="Describe your item in detail. Include what's included, any accessories, usage history..." className="w-full px-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none" />
                {errors.description && <p className="text-destructive text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Condition *</label>
                  <div className="space-y-2">
                    {CONDITIONS.map(c => (
                      <label key={c.value} className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                        watch('condition') === c.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                      }`}>
                        <input {...register('condition')} type="radio" value={c.value} className="accent-primary" />
                        <div>
                          <span className="text-sm font-medium">{c.label}</span>
                          <p className="text-xs text-muted-foreground">{c.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Quantity</label>
                  <input {...register('quantity')} type="number" min="1" max="100" className="w-full px-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                  <p className="text-xs text-muted-foreground mt-1">How many units do you have?</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="flex-1 border border-border py-3 rounded-xl font-medium hover:bg-accent transition-colors flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button type="button" onClick={() => setStep(3)} className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:opacity-90 flex items-center justify-center gap-2">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Pricing ── */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Set Your Price</h2>
              <p className="text-sm text-muted-foreground">
                {listingType === 'RENT' && 'Set daily, weekly & monthly rental rates'}
                {listingType === 'SELL' && 'Set your selling price'}
                {listingType === 'BOTH' && 'Set rental rates and selling price'}
              </p>
            </div>

            {/* Rental Pricing */}
            {(listingType === 'RENT' || listingType === 'BOTH') && (
              <div className="bg-white border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Rental Pricing</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Daily Rate (₹) *</label>
                  <div className="relative">
                    <IndianRupee className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input {...register('rentPriceDaily')} type="number" min="1" placeholder="500" className="w-full pl-9 pr-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">This is the base rate per day</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium">Weekly Rate (₹)</label>
                      {watchedDailyRate && (
                        <button type="button" onClick={suggestWeeklyRate} className="text-xs text-primary hover:underline">
                          Auto-fill
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <IndianRupee className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input {...register('rentPriceWeekly')} type="number" min="1" placeholder="3,000" className="w-full pl-9 pr-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Tip: ~5.5x daily rate</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium">Monthly Rate (₹)</label>
                      {watchedDailyRate && (
                        <button type="button" onClick={suggestMonthlyRate} className="text-xs text-primary hover:underline">
                          Auto-fill
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <IndianRupee className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <input {...register('rentPriceMonthly')} type="number" min="1" placeholder="12,000" className="w-full pl-9 pr-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Tip: ~18x daily rate</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Security Deposit (₹)</label>
                  <div className="relative">
                    <IndianRupee className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input {...register('securityDeposit')} type="number" min="0" placeholder="2,000" className="w-full pl-9 pr-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Refunded when item is returned in good condition</p>
                </div>
              </div>
            )}

            {/* Sale Pricing */}
            {(listingType === 'SELL' || listingType === 'BOTH') && (
              <div className="bg-white border border-border rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">Sale Price</h3>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Selling Price (₹) *</label>
                  <div className="relative">
                    <IndianRupee className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input {...register('buyPrice')} type="number" min="1" placeholder="25,000" className="w-full pl-9 pr-3 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">The price for outright purchase</p>
                </div>
              </div>
            )}

            {/* Platform fee info */}
            <div className="flex items-start gap-2 px-4 py-3 bg-blue-50 rounded-xl text-sm text-blue-700">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>INNEED charges a 10% platform fee on each transaction. This is deducted from the payment before payout.</span>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="flex-1 border border-border py-3 rounded-xl font-medium hover:bg-accent transition-colors flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button type="button" onClick={() => setStep(4)} className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:opacity-90 flex items-center justify-center gap-2">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Photos & Submit ── */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-1">Add Photos</h2>
              <p className="text-sm text-muted-foreground">Items with clear photos get 3x more bookings</p>
            </div>

            <div className="bg-white border border-border rounded-xl p-6">
              <ImageUpload
                value={images}
                onChange={setImages}
                maxImages={6}
                label="Upload Photos (up to 6)"
              />
              <div className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
                <ImagePlus className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Tips: Use good lighting, show item from multiple angles, include any accessories. First photo is the cover image.</span>
              </div>
            </div>

            {/* Summary card */}
            <div className="bg-accent/50 border border-border rounded-xl p-5">
              <h3 className="font-semibold mb-3 text-sm">Listing Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">
                    {listingType === 'RENT' && 'For Rent'}
                    {listingType === 'SELL' && 'For Sale'}
                    {listingType === 'BOTH' && 'Rent & Sell'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Title</span>
                  <span className="font-medium truncate ml-4 max-w-[200px]">{watch('title') || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Condition</span>
                  <span className="font-medium">{CONDITIONS.find(c => c.value === watch('condition'))?.label || '—'}</span>
                </div>
                {(listingType === 'RENT' || listingType === 'BOTH') && watch('rentPriceDaily') && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daily Rate</span>
                    <span className="font-medium text-primary">₹{watch('rentPriceDaily')}/day</span>
                  </div>
                )}
                {(listingType === 'SELL' || listingType === 'BOTH') && watch('buyPrice') && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sale Price</span>
                    <span className="font-medium text-primary">₹{watch('buyPrice')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Photos</span>
                  <span className="font-medium">{images.length} uploaded</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(3)} className="flex-1 border border-border py-3 rounded-xl font-medium hover:bg-accent transition-colors flex items-center justify-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button type="submit" disabled={isSubmitting} className="flex-1 bg-primary text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</> : 'Publish Listing'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
