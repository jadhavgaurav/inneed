'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'

const emailSchema = z.object({ email: z.string().email(), password: z.string().min(1) })
const otpSchema = z.object({ phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid Indian mobile number') })
const otpVerifySchema = z.object({ otp: z.string().length(6, 'OTP must be 6 digits') })

type EmailForm = z.infer<typeof emailSchema>
type OtpForm = z.infer<typeof otpSchema>
type OtpVerifyForm = z.infer<typeof otpVerifySchema>

export default function LoginPage() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [tab, setTab] = useState<'email' | 'phone'>('phone')
  const [phone, setPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) })
  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema) })
  const verifyForm = useForm<OtpVerifyForm>({ resolver: zodResolver(otpVerifySchema) })

  const onEmailLogin = async (data: EmailForm) => {
    try {
      await api.post('/auth/login', data)
      await refreshUser()
      router.push('/')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Login failed')
    }
  }

  const onRequestOtp = async (data: OtpForm) => {
    try {
      await api.post('/auth/otp/request', { phone: data.phone })
      setPhone(data.phone)
      setOtpSent(true)
      toast.success('OTP sent to your phone')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to send OTP')
    }
  }

  const onVerifyOtp = async (data: OtpVerifyForm) => {
    try {
      await api.post('/auth/otp/verify', { phone, otp: data.otp })
      await refreshUser()
      router.push('/')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Invalid OTP')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary">INNEED</h1>
          <p className="text-muted-foreground mt-1">Sign in to your account</p>
        </div>

        {/* Tabs */}
        <div className="flex border border-border rounded-lg mb-6">
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-l-lg transition ${tab === 'phone' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-accent'}`}
            onClick={() => setTab('phone')}
          >
            Phone OTP
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-r-lg transition ${tab === 'email' ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-accent'}`}
            onClick={() => setTab('email')}
          >
            Email
          </button>
        </div>

        {tab === 'phone' && !otpSent && (
          <form onSubmit={otpForm.handleSubmit(onRequestOtp)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mobile Number</label>
              <div className="flex">
                <span className="flex items-center px-3 border border-r-0 border-border rounded-l-lg bg-accent text-sm">+91</span>
                <input
                  {...otpForm.register('phone')}
                  placeholder="9876543210"
                  className="flex-1 px-3 py-2 border border-border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {otpForm.formState.errors.phone && (
                <p className="text-destructive text-xs mt-1">{otpForm.formState.errors.phone.message}</p>
              )}
            </div>
            <button type="submit" disabled={otpForm.formState.isSubmitting} className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50">
              Send OTP
            </button>
          </form>
        )}

        {tab === 'phone' && otpSent && (
          <form onSubmit={verifyForm.handleSubmit(onVerifyOtp)} className="space-y-4">
            <p className="text-sm text-muted-foreground">OTP sent to +91 {phone}</p>
            <div>
              <label className="block text-sm font-medium mb-1">Enter OTP</label>
              <input
                {...verifyForm.register('otp')}
                placeholder="123456"
                maxLength={6}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-widest"
              />
              {verifyForm.formState.errors.otp && (
                <p className="text-destructive text-xs mt-1">{verifyForm.formState.errors.otp.message}</p>
              )}
            </div>
            <button type="submit" disabled={verifyForm.formState.isSubmitting} className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50">
              Verify OTP
            </button>
            <button type="button" onClick={() => setOtpSent(false)} className="w-full text-sm text-muted-foreground hover:underline">
              Change number
            </button>
          </form>
        )}

        {tab === 'email' && (
          <form onSubmit={emailForm.handleSubmit(onEmailLogin)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input {...emailForm.register('email')} type="email" placeholder="you@example.com" className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  {...emailForm.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 pr-10 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={emailForm.formState.isSubmitting} className="w-full bg-primary text-white py-2 rounded-lg font-medium hover:opacity-90 disabled:opacity-50">
              Sign In
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  )
}
