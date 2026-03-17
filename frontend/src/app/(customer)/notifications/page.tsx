'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Bell, Package, AlertTriangle, DollarSign, Star, MessageSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link?: string
  isRead: boolean
  createdAt: string
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  ORDER: <Package className="h-5 w-5 text-blue-500" />,
  BOOKING: <Package className="h-5 w-5 text-orange-500" />,
  RENTAL: <Package className="h-5 w-5 text-green-500" />,
  PAYMENT: <DollarSign className="h-5 w-5 text-emerald-500" />,
  REVIEW: <Star className="h-5 w-5 text-yellow-500" />,
  DISPUTE: <AlertTriangle className="h-5 w-5 text-red-500" />,
  SYSTEM: <Bell className="h-5 w-5 text-gray-500" />,
}

export default function NotificationsPage() {
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data as { notifications: Notification[]; unread: number }),
  })

  const markAllRead = useMutation({
    mutationFn: () => api.post('/notifications/read', {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notif-count'] })
    },
  })

  const markRead = useMutation({
    mutationFn: (id: string) => api.post('/notifications/read', { ids: [id] }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notif-count'] })
    },
  })

  const notifications = data?.notifications ?? []
  const unread = data?.unread ?? 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unread > 0 && (
            <p className="text-sm text-muted-foreground">{unread} unread</p>
          )}
        </div>
        {unread > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
          >
            Mark all read
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && notifications.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Bell className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p>No notifications yet</p>
        </div>
      )}

      <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
        {notifications.map(n => {
          const content = (
            <div
              className={cn(
                'flex gap-3 px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer',
                !n.isRead && 'bg-blue-50/50'
              )}
              onClick={() => !n.isRead && markRead.mutate(n.id)}
            >
              <div className="mt-0.5 flex-shrink-0">
                {TYPE_ICONS[n.type] ?? <Bell className="h-5 w-5 text-gray-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={cn('text-sm', !n.isRead && 'font-semibold')}>{n.title}</p>
                  {!n.isRead && <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{n.message}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDate(n.createdAt)}</p>
              </div>
            </div>
          )

          return n.link ? (
            <Link key={n.id} href={n.link}>{content}</Link>
          ) : (
            <div key={n.id}>{content}</div>
          )
        })}
      </div>
    </div>
  )
}
