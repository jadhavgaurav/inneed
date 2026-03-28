'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  ShoppingCart, Bell, User, LogOut, Search, Menu, X,
  Camera, Bike, Wrench, Sofa, Laptop, Music, ChevronRight, Package,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthContext'
import api from '@/lib/api'
import { toast } from 'sonner'

const CATEGORIES = [
  { icon: Camera, name: 'Cameras', slug: 'cameras' },
  { icon: Bike, name: 'Bikes', slug: 'bikes' },
  { icon: Wrench, name: 'Tools', slug: 'tools' },
  { icon: Sofa, name: 'Furniture', slug: 'furniture' },
  { icon: Laptop, name: 'Electronics', slug: 'electronics' },
  { icon: Music, name: 'Instruments', slug: 'instruments' },
]

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const { data: notifData } = useQuery({
    queryKey: ['notif-count'],
    queryFn: () => api.get('/notifications/unread-count').then(r => r.data as { count: number }),
    enabled: isAuthenticated,
    refetchInterval: 30000,
  })
  const unreadCount = notifData?.count ?? 0

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
    setUserMenuOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    await logout()
    toast.success('Logged out')
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">

      {/* ── Row 1: Logo | Search | Actions ── */}
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 flex-shrink-0 mr-2">
          <div className="w-7 h-7 bg-primary rounded-md flex items-center justify-center">
            <Package className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-bold text-primary tracking-tight">INNEED</span>
        </Link>

        {/* Search bar — always visible on desktop */}
        <form action="/search" className="flex-1 max-w-2xl hidden sm:flex">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              name="q"
              placeholder="Search items to rent…"
              className="w-full pl-9 pr-4 py-2.5 border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-muted/40 hover:bg-white transition-colors"
            />
          </div>
        </form>

        {/* Actions */}
        <nav className="flex items-center gap-1">

          {/* Mobile search icon */}
          <Link
            href="/search"
            className="sm:hidden p-2 hover:bg-accent rounded-lg text-muted-foreground"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                href="/cart"
                className="p-2 hover:bg-accent rounded-lg text-muted-foreground"
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
              </Link>

              <Link
                href="/notifications"
                className="relative p-2 hover:bg-accent rounded-lg text-muted-foreground"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {user?.isVendorApproved && (
                <Link
                  href="/vendor/dashboard"
                  className="hidden md:block text-sm font-medium text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Vendor
                </Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="hidden md:block text-sm font-medium text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Admin
                </Link>
              )}

              {/* User menu — click-based (accessible on mobile) */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-1.5 p-1.5 hover:bg-accent rounded-lg transition-colors"
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-border rounded-xl shadow-xl py-1 z-50">
                    <div className="px-4 py-2.5 border-b border-border">
                      <p className="text-sm font-semibold truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-accent transition-colors">
                      <User className="h-4 w-4 text-muted-foreground" /> Profile
                    </Link>
                    <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-accent transition-colors">
                      <Package className="h-4 w-4 text-muted-foreground" /> My Orders
                    </Link>
                    <Link href="/rentals" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-accent transition-colors">
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" /> My Rentals
                    </Link>
                    <Link href="/saved" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-accent transition-colors">
                      <Bell className="h-4 w-4 text-muted-foreground" /> Saved Items
                    </Link>
                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-accent transition-colors text-destructive"
                      >
                        <LogOut className="h-4 w-4" /> Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:block text-sm font-medium text-foreground hover:text-primary px-3 py-2 rounded-lg hover:bg-accent transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Sign up
              </Link>
              <Link
                href="/vendor/onboarding"
                className="hidden lg:flex items-center gap-1 border border-primary text-primary px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary/5 transition-colors ml-1"
              >
                List Your Item
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(v => !v)}
            className="sm:hidden p-2 hover:bg-accent rounded-lg text-muted-foreground ml-1"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </div>

      {/* ── Row 2: Category Nav Bar ── */}
      <div className="border-t border-border/60 bg-white/95">
        <div className="max-w-7xl mx-auto px-4">
          <div
            className="flex items-center gap-0.5 overflow-x-auto py-1.5"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {CATEGORIES.map(({ icon: Icon, name, slug }) => (
              <Link
                key={slug}
                href={`/search?categorySlug=${slug}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-muted-foreground hover:text-primary hover:bg-primary/8 transition-colors whitespace-nowrap flex-shrink-0 font-medium"
              >
                <Icon className="h-3.5 w-3.5" />
                {name}
              </Link>
            ))}
            <div className="w-px h-4 bg-border mx-2 flex-shrink-0" />
            <Link
              href="/search"
              className="flex items-center gap-0.5 px-3 py-1.5 rounded-full text-sm text-primary font-medium hover:bg-primary/8 transition-colors whitespace-nowrap flex-shrink-0"
            >
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer ── */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-border bg-white shadow-lg">
          {/* Mobile search bar */}
          <div className="px-4 py-3 border-b border-border">
            <form action="/search" className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                name="q"
                placeholder="Search items to rent…"
                className="w-full pl-9 pr-4 py-2.5 border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-muted/40"
              />
            </form>
          </div>

          <div className="px-4 py-3 space-y-0.5">
            {!isAuthenticated ? (
              <>
                <Link href="/login" className="block py-2.5 text-sm font-medium hover:text-primary transition-colors">Sign in</Link>
                <Link href="/signup" className="block py-2.5 text-sm font-semibold text-primary transition-colors">Sign up</Link>
                <Link href="/vendor/onboarding" className="block py-2.5 text-sm text-muted-foreground hover:text-primary transition-colors">List Your Item</Link>
              </>
            ) : (
              <>
                <div className="py-2 border-b border-border mb-2">
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <Link href="/profile" className="block py-2.5 text-sm hover:text-primary transition-colors">Profile</Link>
                <Link href="/orders" className="block py-2.5 text-sm hover:text-primary transition-colors">My Orders</Link>
                <Link href="/rentals" className="block py-2.5 text-sm hover:text-primary transition-colors">My Rentals</Link>
                <Link href="/cart" className="block py-2.5 text-sm hover:text-primary transition-colors">Cart</Link>
                <Link href="/notifications" className="block py-2.5 text-sm hover:text-primary transition-colors">
                  Notifications {unreadCount > 0 && <span className="ml-1 bg-destructive text-white text-xs rounded-full px-1.5 py-0.5">{unreadCount}</span>}
                </Link>
                {user?.isVendorApproved && (
                  <Link href="/vendor/dashboard" className="block py-2.5 text-sm text-primary font-medium">Vendor Dashboard</Link>
                )}
                {user?.role === 'ADMIN' && (
                  <Link href="/admin" className="block py-2.5 text-sm text-primary font-medium">Admin Panel</Link>
                )}
                <div className="border-t border-border pt-2 mt-2">
                  <button onClick={handleLogout} className="block py-2.5 text-sm text-destructive w-full text-left">
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
