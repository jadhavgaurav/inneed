'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, ShoppingCart, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import api from '@/lib/api'
import { motion } from 'motion/react'

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { isAuthenticated } = useAuth()

  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: () => api.get('/cart').then(r => r.data),
    enabled: isAuthenticated,
  })
  const cartCount = cartData?.items?.length ?? 0

  const tabs = [
    { href: '/', icon: Home, label: 'Home', match: (p: string) => p === '/' },
    { href: '/search', icon: Search, label: 'Explore', match: (p: string) => p.startsWith('/search') },
    { href: '/cart', icon: ShoppingCart, label: 'Cart', match: (p: string) => p.startsWith('/cart'), badge: cartCount },
    {
      href: isAuthenticated ? '/profile' : '/login',
      icon: User,
      label: isAuthenticated ? 'Account' : 'Sign in',
      match: (p: string) => p === '/profile' || p === '/login' || p === '/signup',
    },
  ]

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border sm:hidden pb-safe"
    >
      <div className="flex items-center justify-around h-14">
        {tabs.map(({ href, icon: Icon, label, match, badge }) => {
          const active = match(pathname)
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[48px] transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
                {!!badge && badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-primary text-white text-[9px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] leading-tight ${active ? 'font-semibold' : 'font-medium'}`}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </motion.nav>
  )
}
