'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Users, Package, ShoppingBag, TrendingUp } from 'lucide-react'
import { formatINR } from '@/lib/utils'

interface Analytics {
  totalUsers: number
  totalListings: number
  totalOrders: number
  totalRevenue: number
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string
  value: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="bg-white border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => api.get('/admin/analytics').then(r => r.data as Analytics),
  })

  const { data: configData } = useQuery({
    queryKey: ['admin-config'],
    queryFn: () => api.get('/admin/config').then(r => r.data as { key: string; value: string }[]),
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-2xl font-bold">Platform Analytics</h1>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Users" value={data?.totalUsers.toLocaleString() ?? '0'} icon={Users} color="bg-blue-500" />
          <StatCard title="Active Listings" value={data?.totalListings.toLocaleString() ?? '0'} icon={Package} color="bg-green-500" />
          <StatCard title="Total Orders" value={data?.totalOrders.toLocaleString() ?? '0'} icon={ShoppingBag} color="bg-orange-500" />
          <StatCard title="Total Revenue" value={formatINR(data?.totalRevenue ?? 0)} icon={TrendingUp} color="bg-purple-500" />
        </div>
      )}

      {/* Platform Configuration */}
      <div>
        <h2 className="text-xl font-bold mb-4">Platform Configuration</h2>
        <div className="bg-white border border-border rounded-xl divide-y divide-border">
          {configData?.map(cfg => (
            <div key={cfg.key} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="font-medium text-sm">{cfg.key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</p>
                <p className="text-xs text-muted-foreground font-mono">{cfg.key}</p>
              </div>
              <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{cfg.value}</span>
            </div>
          ))}
          {(!configData || configData.length === 0) && (
            <p className="px-4 py-3 text-sm text-muted-foreground">No configuration found</p>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-bold mb-4">Management</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { href: '/admin/vendors', label: 'Vendor Approvals', desc: 'Review pending vendor applications' },
            { href: '/admin/disputes', label: 'Dispute Queue', desc: 'Resolve customer and vendor disputes' },
          ].map(link => (
            <a
              key={link.href}
              href={link.href}
              className="border border-border rounded-xl p-4 hover:bg-accent transition-colors"
            >
              <p className="font-medium text-sm">{link.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{link.desc}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
