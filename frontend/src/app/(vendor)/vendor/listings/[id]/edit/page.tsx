'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'

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
  status: z.enum(['ACTIVE', 'PAUSED', 'DRAFT']),
})

type FormData = z.infer<typeof schema>

const CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'HEAVY_USE', label: 'Heavy Use' },
]

export default function EditListingPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const listingId = params.id as string

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data),
  })

  const { data: listing, isLoading } = useQuery({
    queryKey: ['vendor', 'listing', listingId],
    queryFn: () => api.get(`/listings/${listingId}`).then(r => r.data),
    enabled: !!listingId,
  })

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      availableForRent: true,
      availableForSale: false,
      quantity: 1,
      securityDeposit: 0,
      status: 'ACTIVE',
    },
  })

  // Populate form when listing loads
  useEffect(() => {
    if (listing) {
      reset({
        categoryId: listing.categoryId ?? '',
        title: listing.title ?? '',
        description: listing.description ?? '',
        condition: listing.condition ?? 'GOOD',
        availableForRent: listing.availableForRent ?? true,
        availableForSale: listing.availableForSale ?? false,
        quantity: listing.quantity ?? 1,
        rentPriceDaily: listing.pricing?.rentPriceDaily ?? '',
        rentPriceWeekly: listing.pricing?.rentPriceWeekly ?? '',
        rentPriceMonthly: listing.pricing?.rentPriceMonthly ?? '',
        buyPrice: listing.pricing?.buyPrice ?? '',
        securityDeposit: listing.pricing?.securityDeposit ?? 0,
        status: listing.status ?? 'ACTIVE',
      })
    }
  }, [listing, reset])

  const availableForRent = watch('availableForRent')
  const availableForSale = watch('availableForSale')

  const updateMutation = useMutation({
    mutationFn: (data: any) => api.put(`/vendor/listings/${listingId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor', 'listings'] })
      queryClient.invalidateQueries({ queryKey: ['vendor', 'listing', listingId] })
      toast.success('Listing updated!')
      router.push('/vendor/listings')
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || 'Failed to update listing')
    },
  })

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      rentPriceDaily: data.rentPriceDaily || undefined,
      rentPriceWeekly: data.rentPriceWeekly || undefined,
      rentPriceMonthly: data.rentPriceMonthly || undefined,
      buyPrice: data.buyPrice || undefined,
    }
    updateMutation.mutate(payload)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground mb-4">Listing not found or you don't have permission to edit it.</p>
        <Link href="/vendor/listings" className="text-primary hover:underline">← Back to listings</Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back nav */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/vendor/listings" className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Edit Listing</h1>
          <p className="text-sm text-muted-foreground truncate max-w-xs">{listing.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Status */}
        <div className="bg-white border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Status</h2>
          <div className="flex gap-3">
            {(['ACTIVE', 'PAUSED', 'DRAFT'] as const).map(s => {
              const colors = {
                ACTIVE: 'border-green-400 bg-green-50 text-green-700',
                PAUSED: 'border-yellow-400 bg-yellow-50 text-yellow-700',
                DRAFT: 'border-border bg-muted text-muted-foreground',
              }
              return (
                <label key={s} className="cursor-pointer">
                  <input {...register('status')} type="radio" value={s} className="sr-only" />
                  <span className={`block px-4 py-1.5 rounded-full border-2 text-sm font-medium transition-all
                    ${watch('status') === s ? colors[s] : 'border-border text-muted-foreground hover:border-primary/40'}`}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </span>
                </label>
              )
            })}
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select {...register('categoryId')} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm">
              <option value="">Select a category</option>
              {categories?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="text-destructive text-xs mt-1">{errors.categoryId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              {...register('title')}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              {...register('description')}
              rows={5}
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none"
            />
            {errors.description && <p className="text-destructive text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Condition</label>
              <select {...register('condition')} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm">
                {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input
                {...register('quantity')}
                type="number" min="1" max="100"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register('availableForRent')} type="checkbox" className="accent-primary" />
              <span className="text-sm">Available for Rent</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input {...register('availableForSale')} type="checkbox" className="accent-primary" />
              <span className="text-sm">Available for Sale</span>
            </label>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold">Pricing</h2>

          {availableForRent && (
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Daily (₹)</label>
                <input
                  {...register('rentPriceDaily')}
                  type="number" min="1" placeholder="500"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Weekly (₹)</label>
                <input
                  {...register('rentPriceWeekly')}
                  type="number" min="1" placeholder="3000"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Monthly (₹)</label>
                <input
                  {...register('rentPriceMonthly')}
                  type="number" min="1" placeholder="10000"
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                />
              </div>
            </div>
          )}

          {availableForSale && (
            <div>
              <label className="block text-sm font-medium mb-1">Sale Price (₹)</label>
              <input
                {...register('buyPrice')}
                type="number" min="1" placeholder="25000"
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Security Deposit (₹)</label>
            <input
              {...register('securityDeposit')}
              type="number" min="0" placeholder="2000"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">Collected and held until item is returned in good condition</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting || updateMutation.isPending || !isDirty}
            className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {(isSubmitting || updateMutation.isPending) ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
            ) : 'Save Changes'}
          </button>
          <Link
            href="/vendor/listings"
            className="px-6 py-3 border border-border rounded-xl font-medium hover:bg-accent transition-colors text-sm"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
