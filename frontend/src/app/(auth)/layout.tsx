'use client'

import Link from 'next/link'
import { Package, ArrowLeft } from 'lucide-react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthBrandingPanel } from '@/components/auth/AuthBrandingPanel'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''}>
      <div className="min-h-dvh flex flex-col md:flex-row">
        {/* Mobile header */}
        <header className="md:hidden border-b border-border bg-white">
          <div className="px-4 h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-1.5">
              <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                <Package className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-primary tracking-tight">INNEED</span>
            </Link>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Home
            </Link>
          </div>
        </header>

        {/* Left branding panel — hidden below md */}
        <AuthBrandingPanel />

        {/* Right form panel */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Desktop header inside form panel */}
          <header className="hidden md:flex items-center justify-between px-8 py-5">
            <Link href="/" className="flex items-center gap-1.5">
              <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
                <Package className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-primary tracking-tight">INNEED</span>
            </Link>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
            >
              Back to home
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
          </header>

          <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-8">
            <div className="w-full max-w-[440px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </GoogleOAuthProvider>
  )
}
