'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
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
})

type FormData = z.infer<typeof schema>

const CONDITIONS = [
  { value: 'NEW', label: 'New' },
  { value: 'LIKE_NEW', label: 'Like New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'HEAVY_USE', label: 'Heavy Use' },
]

export default function NewListingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get('/categories').then(r => r.data),
  })

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { availableForRent: true, availableForSale: false, quantity: 1, securityDeposit: 0 },
  })

  const availableForRent = watch('availableForRent')
  const availableForSale = watch('availableForSale')

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
      toast.success('Listing created!')
      router.push('/vendor/listings')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to create listing')
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Listing</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select {...register('categoryId')} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="">Select a category</option>
              {categories?.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            {errors.categoryId && <p className="text-destructive text-xs mt-1">{errors.categoryId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input {...register('title')} placeholder="DSLR Camera Canon 700D with 18-55mm Lens" className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea {...register('description')} rows={5} placeholder="Describe your item in detail..." className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
            {errors.description && <p className="text-destructive text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Condition</label>
              <select {...register('condition')} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <input {...register('quantity')} type="number" min="1" max="100" className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
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
                <label className="block text-sm font-medium mb-1">Daily Rate (₹)</label>
                <input {...register('rentPriceDaily')} type="number" min="1" placeholder="500" className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Weekly Rate (₹)</label>
                <input {...register('rentPriceWeekly')} type="number" min="1" placeholder="3000" className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Monthly Rate (₹)</label>
                <input {...register('rentPriceMonthly')} type="number" min="1" placeholder="10000" className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>
          )}

          {availableForSale && (
            <div>
              <label className="block text-sm font-medium mb-1">Sale Price (₹)</label>
              <input {...register('buyPrice')} type="number" min="1" placeholder="25000" className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Security Deposit (₹)</label>
            <input {...register('securityDeposit')} type="number" min="0" placeholder="2000" className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            <p className="text-xs text-muted-foreground mt-1">Collected and held until item is returned in good condition</p>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50">
          {isSubmitting ? 'Creating...' : 'Create Listing'}
        </button>
      </form>
    </div>
  )
}
