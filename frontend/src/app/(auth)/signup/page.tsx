'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'
import { OrDivider } from '@/components/auth/OrDivider'
import { PasswordStrengthBar } from '@/components/auth/PasswordStrengthBar'

const emailSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
const otpSchema = z.object({ phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid Indian mobile number') })
const otpVerifySchema = z.object({ otp: z.string().length(6, 'OTP must be 6 digits') })

type EmailForm = z.infer<typeof emailSchema>
type OtpForm = z.infer<typeof otpSchema>
type OtpVerifyForm = z.infer<typeof otpVerifySchema>

export default function SignupPage() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [tab, setTab] = useState<'phone' | 'email'>('phone')
  const [phone, setPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) })
  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema) })
  const verifyForm = useForm<OtpVerifyForm>({ resolver: zodResolver(otpVerifySchema) })

  const watchedPassword = emailForm.watch('password') || ''

  const onEmailSignup = async (data: EmailForm) => {
    try {
      await api.post('/auth/register', data)
      await refreshUser()
      router.push('/')
      toast.success('Welcome to INNEED!')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Registration failed')
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
      toast.success('Welcome to INNEED!')
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Invalid OTP')
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="text-muted-foreground text-sm mt-1">Join thousands of renters on INNEED</p>
      </div>

      {/* Google sign-in */}
      <GoogleSignInButton />
      <OrDivider />

      {/* Tabs */}
      <div className="flex bg-muted rounded-lg p-1 mb-6" role="tablist">
        {(['phone', 'email'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => { setTab(t); setOtpSent(false) }}
            className="relative flex-1 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer z-10"
            style={{ color: tab === t ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))' }}
          >
            {tab === t && (
              <motion.div
                layoutId="signup-tab"
                className="absolute inset-0 bg-white rounded-md shadow-sm"
                transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
              />
            )}
            <span className="relative z-10">{t === 'phone' ? 'Phone OTP' : 'Email'}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab + (otpSent ? '-otp' : '')}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          {/* Phone OTP — Request */}
          {tab === 'phone' && !otpSent && (
            <form onSubmit={otpForm.handleSubmit(onRequestOtp)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-phone">Mobile Number</Label>
                <div className="flex">
                  <span className="flex items-center px-3 border border-r-0 border-border rounded-l-lg bg-muted text-sm text-muted-foreground">
                    +91
                  </span>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-phone"
                      {...otpForm.register('phone')}
                      placeholder="9876543210"
                      inputMode="numeric"
                      className="h-11 pl-10 rounded-l-none"
                    />
                  </div>
                </div>
                {otpForm.formState.errors.phone && (
                  <p className="text-destructive text-xs">{otpForm.formState.errors.phone.message}</p>
                )}
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={otpForm.formState.isSubmitting}
                className="w-full h-12 text-base font-medium cursor-pointer"
              >
                {otpForm.formState.isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending...</>
                ) : (
                  'Send OTP'
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                We&apos;ll create your account automatically with your phone number.
              </p>
            </form>
          )}

          {/* Phone OTP — Verify */}
          {tab === 'phone' && otpSent && (
            <form onSubmit={verifyForm.handleSubmit(onVerifyOtp)} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                OTP sent to <span className="font-medium text-foreground">+91 {phone}</span>
              </p>
              <div className="space-y-2">
                <Label htmlFor="signup-otp">Enter OTP</Label>
                <Input
                  id="signup-otp"
                  {...verifyForm.register('otp')}
                  placeholder="000000"
                  maxLength={6}
                  inputMode="numeric"
                  className="h-12 text-center text-2xl tracking-[0.3em] font-mono"
                />
                {verifyForm.formState.errors.otp && (
                  <p className="text-destructive text-xs">{verifyForm.formState.errors.otp.message}</p>
                )}
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={verifyForm.formState.isSubmitting}
                className="w-full h-12 text-base font-medium cursor-pointer"
              >
                {verifyForm.formState.isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Verifying...</>
                ) : (
                  'Verify & Create Account'
                )}
              </Button>
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Change number
              </button>
            </form>
          )}

          {/* Email signup */}
          {tab === 'email' && (
            <form onSubmit={emailForm.handleSubmit(onEmailSignup)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    {...emailForm.register('name')}
                    placeholder="Rahul Sharma"
                    className="h-11 pl-10"
                  />
                </div>
                {emailForm.formState.errors.name && (
                  <p className="text-destructive text-xs">{emailForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    {...emailForm.register('email')}
                    type="email"
                    placeholder="you@example.com"
                    className="h-11 pl-10"
                  />
                </div>
                {emailForm.formState.errors.email && (
                  <p className="text-destructive text-xs">{emailForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    {...emailForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 8 characters"
                    className="h-11 pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {emailForm.formState.errors.password && (
                  <p className="text-destructive text-xs">{emailForm.formState.errors.password.message}</p>
                )}
                <PasswordStrengthBar password={watchedPassword} />
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={emailForm.formState.isSubmitting}
                className="w-full h-12 text-base font-medium cursor-pointer"
              >
                {emailForm.formState.isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Creating account...</>
                ) : (
                  'Create Account'
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </form>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Footer link */}
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
