import Link from 'next/link'
import { Package } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Minimal header — logo only */}
      <header className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center">
          <Link href="/" className="flex items-center gap-1.5">
            <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
              <Package className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-primary tracking-tight">INNEED</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        {children}
      </main>
    </div>
  )
}
