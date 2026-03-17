'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Bell, User, LogOut, Search } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        <Link href="/" className="text-xl font-bold text-primary flex-shrink-0">INNEED</Link>

        {/* Search bar */}
        <form action="/search" className="flex-1 max-w-xl hidden sm:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              name="q"
              placeholder="Search items to rent..."
              className="w-full pl-9 pr-4 py-2 border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </form>

        <nav className="flex items-center gap-2 ml-auto">
          {isAuthenticated ? (
            <>
              <Link href="/cart" className="p-2 hover:bg-accent rounded-lg">
                <ShoppingCart className="h-5 w-5" />
              </Link>
              <Link href="/notifications" className="p-2 hover:bg-accent rounded-lg">
                <Bell className="h-5 w-5" />
              </Link>
              {user?.isVendorApproved && (
                <Link href="/vendor/dashboard" className="text-sm font-medium text-primary hover:underline">
                  Vendor
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link href="/admin" className="text-sm font-medium text-primary hover:underline">
                  Admin
                </Link>
              )}
              <div className="relative group">
                <button className="p-2 hover:bg-accent rounded-lg">
                  <User className="h-5 w-5" />
                </button>
                <div className="absolute right-0 mt-1 w-48 bg-white border border-border rounded-xl shadow-lg py-1 hidden group-hover:block">
                  <p className="px-4 py-2 text-sm font-medium border-b border-border">{user?.name}</p>
                  <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-accent">Profile</Link>
                  <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-accent">My Orders</Link>
                  <Link href="/rentals" className="block px-4 py-2 text-sm hover:bg-accent">My Rentals</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center gap-2 text-destructive">
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium hover:underline">Sign in</Link>
              <Link href="/signup" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
