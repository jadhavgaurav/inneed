'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

const step1Schema = z.object({
  businessName: z.string().min(2).max(100),
  businessType: z.string().min(2).max(50),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  bio: z.string().max(500).optional(),
})

const step2Schema = z.object({
  address: z.string().min(5).max(200),
  city: z.string().min(2).max(50),
  state: z.string().min(2).max(50),
  pincode: z.string().regex(/^\d{6}$/),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

const STEPS = ['Business Info', 'Location', 'Documents', 'Review']
const INDIAN_STATES = ['Andhra Pradesh','Gujarat','Karnataka','Kerala','Maharashtra','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal','Delhi','Other']

export default function VendorOnboardingPage() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [step, setStep] = useState(0)
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema) })
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema) })

  const handleStep1 = (data: Step1Data) => {
    setStep1Data(data)
    setStep(1)
  }

  const handleStep2 = (data: Step2Data) => {
    setStep2Data(data)
    setStep(2)
  }

  const handleSubmit = async () => {
    if (!step1Data || !step2Data) return
    setIsSubmitting(true)
    try {
      await api.post('/vendor/onboarding', {
        ...step1Data,
        ...step2Data,
        latitude: 19.076,  // Default Mumbai coords; real app uses geolocation
        longitude: 72.8777,
      })
      await refreshUser()
      toast.success('Vendor profile submitted! Awaiting approval.')
      router.push('/')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Onboarding failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Become a Vendor on INNEED</h1>
          <p className="text-muted-foreground mt-1">Start earning by renting your items</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${i <= step ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                {i + 1}
              </div>
              <span className={`ml-2 text-sm hidden sm:block ${i <= step ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`w-8 h-px mx-2 ${i < step ? 'bg-primary' : 'bg-border'}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          {step === 0 && (
            <form onSubmit={form1.handleSubmit(handleStep1)} className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Business Information</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Business Name</label>
                <input {...form1.register('businessName')} placeholder="My Rental Shop" className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                {form1.formState.errors.businessName && <p className="text-destructive text-xs mt-1">{form1.formState.errors.businessName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Business Type</label>
                <select {...form1.register('businessType')} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select type</option>
                  <option>Individual</option>
                  <option>Partnership</option>
                  <option>Private Limited</option>
                  <option>Proprietorship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Business Phone</label>
                <input {...form1.register('phone')} placeholder="9876543210" className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                {form1.formState.errors.phone && <p className="text-destructive text-xs mt-1">{form1.formState.errors.phone.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bio (optional)</label>
                <textarea {...form1.register('bio')} rows={3} placeholder="Tell customers about your business..." className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
              </div>
              <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:opacity-90">Next</button>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={form2.handleSubmit(handleStep2)} className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Business Location</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <input {...form2.register('address')} placeholder="123, MG Road" className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input {...form2.register('city')} placeholder="Mumbai" className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Pincode</label>
                  <input {...form2.register('pincode')} placeholder="400001" maxLength={6} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                  {form2.formState.errors.pincode && <p className="text-destructive text-xs mt-1">{form2.formState.errors.pincode.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <select {...form2.register('state')} className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Select state</option>
                  {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(0)} className="flex-1 border border-border py-2 rounded-lg font-medium hover:bg-accent">Back</button>
                <button type="submit" className="flex-1 bg-primary text-white py-2 rounded-lg font-medium hover:opacity-90">Next</button>
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Documents (KYC)</h2>
              <p className="text-sm text-muted-foreground">Upload one government-issued ID for verification. Documents are reviewed within 24 hours.</p>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <p className="text-muted-foreground text-sm">Document upload will be available after onboarding approval.</p>
                <p className="text-xs text-muted-foreground mt-1">Supported: Aadhaar, PAN, Passport, Driving License</p>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="flex-1 border border-border py-2 rounded-lg font-medium hover:bg-accent">Back</button>
                <button type="button" onClick={() => setStep(3)} className="flex-1 bg-primary text-white py-2 rounded-lg font-medium hover:opacity-90">Next</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Review & Submit</h2>
              {step1Data && (
                <div className="bg-accent rounded-lg p-4 space-y-2">
                  <p className="font-medium">{step1Data.businessName}</p>
                  <p className="text-sm text-muted-foreground">{step1Data.businessType} · {step1Data.phone}</p>
                  {step2Data && <p className="text-sm text-muted-foreground">{step2Data.address}, {step2Data.city}, {step2Data.state} — {step2Data.pincode}</p>}
                </div>
              )}
              <p className="text-sm text-muted-foreground">Your application will be reviewed within 24 hours. You&apos;ll receive a notification once approved.</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="flex-1 border border-border py-2 rounded-lg font-medium hover:bg-accent">Back</button>
                <button type="button" onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-primary text-white py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50">
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
