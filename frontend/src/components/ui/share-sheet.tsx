'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Link2, Mail, Send, MoreHorizontal, Check, X, MessageSquare, Facebook, Twitter } from 'lucide-react'
import { toast } from 'sonner'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

/* ─── WhatsApp inline SVG icon (brand recognition matters in India) ─── */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

/* ─── Types ─── */
export interface ShareSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  url: string
  title: string
  text?: string
}

/* ─── Share option definition ─── */
interface ShareOption {
  id: string
  label: string
  icon: React.ReactNode
  color: string       // bg color for the circle
  iconColor: string   // icon color
  action: () => void
  mobileOnly?: boolean
  desktopOnly?: boolean
}

/* ─── Hook: detect mobile ─── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isMobile
}

/* ─── Main component ─── */
export function ShareSheet({ open, onOpenChange, url, title, text }: ShareSheetProps) {
  const isMobile = useIsMobile()
  const [copied, setCopied] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const encodedText = encodeURIComponent(text || title)

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Fallback for insecure contexts / sandboxed iframes
      const ta = document.createElement('textarea')
      ta.value = url
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }, [url])

  const openUrl = useCallback((shareUrl: string) => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer')
    onOpenChange(false)
  }, [onOpenChange])

  const triggerNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: text || title, url })
      } catch { /* user cancelled */ }
    }
    onOpenChange(false)
  }, [title, text, url, onOpenChange])

  /* ─── Share options ─── */
  const options: ShareOption[] = [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: <WhatsAppIcon className="h-5 w-5" />,
      color: 'bg-[#25D366]/10',
      iconColor: 'text-[#25D366]',
      action: () => openUrl(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`),
    },
    {
      id: 'sms',
      label: 'Message',
      icon: <MessageSquare className="h-5 w-5" />,
      color: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
      action: () => openUrl(`sms:?body=${encodedTitle}%20${encodedUrl}`),
    },
    {
      id: 'copy',
      label: copied ? 'Copied!' : 'Copy Link',
      icon: copied ? <Check className="h-5 w-5" /> : <Link2 className="h-5 w-5" />,
      color: copied ? 'bg-green-500/10' : 'bg-gray-500/10',
      iconColor: copied ? 'text-green-600' : 'text-gray-600',
      action: copyLink,
    },
    {
      id: 'more',
      label: 'More',
      icon: <MoreHorizontal className="h-5 w-5" />,
      color: 'bg-gray-500/10',
      iconColor: 'text-gray-600',
      action: triggerNativeShare,
      mobileOnly: true,
    },
    {
      id: 'email',
      label: 'Email',
      icon: <Mail className="h-5 w-5" />,
      color: 'bg-red-500/10',
      iconColor: 'text-red-500',
      action: () => openUrl(`mailto:?subject=${encodedTitle}&body=${encodedText}%20${encodedUrl}`),
      desktopOnly: true,
    },
    {
      id: 'twitter',
      label: 'Twitter',
      icon: <Twitter className="h-5 w-5" />,
      color: 'bg-sky-500/10',
      iconColor: 'text-sky-500',
      action: () => openUrl(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`),
      desktopOnly: true,
    },
    {
      id: 'facebook',
      label: 'Facebook',
      icon: <Facebook className="h-5 w-5" />,
      color: 'bg-[#1877F2]/10',
      iconColor: 'text-[#1877F2]',
      action: () => openUrl(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`),
      desktopOnly: true,
    },
    {
      id: 'telegram',
      label: 'Telegram',
      icon: <Send className="h-5 w-5" />,
      color: 'bg-[#26A5E4]/10',
      iconColor: 'text-[#26A5E4]',
      action: () => openUrl(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`),
      desktopOnly: true,
    },
  ]

  const filteredOptions = options.filter(opt => {
    if (isMobile && opt.desktopOnly) return false
    if (!isMobile && opt.mobileOnly) return false
    return true
  })

  /* ─── Truncated URL display ─── */
  const displayUrl = url.replace(/^https?:\/\//, '').slice(0, 40) + (url.length > 48 ? '…' : '')

  /* ─── Share grid content (shared between mobile and desktop) ─── */
  const shareContent = (
    <div className="px-5 py-4">
      {/* Share option grid */}
      <div className="grid grid-cols-4 gap-y-5 gap-x-2 mb-5">
        {filteredOptions.map(opt => (
          <button
            key={opt.id}
            onClick={opt.action}
            className="flex flex-col items-center gap-1.5 group outline-none"
            aria-label={`Share via ${opt.label}`}
          >
            <div className={`w-12 h-12 rounded-full ${opt.color} flex items-center justify-center ${opt.iconColor} transition-transform group-hover:scale-110 group-focus-visible:ring-2 group-focus-visible:ring-primary group-focus-visible:ring-offset-2`}>
              {opt.icon}
            </div>
            <span className="text-[11px] font-medium text-muted-foreground leading-tight">
              {opt.label}
            </span>
          </button>
        ))}
      </div>

      {/* URL copy bar */}
      <button
        onClick={copyLink}
        className="w-full flex items-center gap-2.5 bg-accent/60 hover:bg-accent rounded-xl px-3.5 py-3 transition-colors group"
        aria-label="Copy link to clipboard"
      >
        <Link2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm text-muted-foreground truncate flex-1 text-left">
          {displayUrl}
        </span>
        <span className="text-xs font-semibold text-primary flex-shrink-0 group-hover:underline">
          {copied ? 'Copied!' : 'Copy'}
        </span>
      </button>
    </div>
  )

  /* ─── Mobile: Vaul Drawer ─── */
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Share</DrawerTitle>
          </DrawerHeader>
          {shareContent}
        </DrawerContent>
      </Drawer>
    )
  }

  /* ─── Desktop: Animated dialog ─── */
  return (
    <AnimatePresence>
      {open && (
        <DesktopDialog onClose={() => onOpenChange(false)}>
          {shareContent}
        </DesktopDialog>
      )}
    </AnimatePresence>
  )
}

/* ─── Desktop dialog sub-component ─── */
function DesktopDialog({
  children,
  onClose,
}: {
  children: React.ReactNode
  onClose: () => void
}) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-50 bg-black/25"
        onClick={onClose}
        aria-hidden
      />

      {/* Centering wrapper */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-[340px] bg-white rounded-2xl shadow-2xl border border-border overflow-hidden pointer-events-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Share options"
        >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-1">
          <h3 className="text-base font-semibold">Share</h3>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground"
            aria-label="Close share dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {children}
        </motion.div>
      </div>
    </>
  )
}
