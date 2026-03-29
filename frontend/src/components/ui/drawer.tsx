'use client'

import * as React from 'react'
import { Drawer as VaulDrawer } from 'vaul'
import { cn } from '@/lib/utils'

const Drawer = VaulDrawer.Root
const DrawerTrigger = VaulDrawer.Trigger
const DrawerClose = VaulDrawer.Close
const DrawerPortal = VaulDrawer.Portal
const DrawerOverlay = React.forwardRef<
  React.ComponentRef<typeof VaulDrawer.Overlay>,
  React.ComponentPropsWithoutRef<typeof VaulDrawer.Overlay>
>(({ className, ...props }, ref) => (
  <VaulDrawer.Overlay
    ref={ref}
    className={cn('fixed inset-0 z-50 bg-black/40', className)}
    {...props}
  />
))
DrawerOverlay.displayName = 'DrawerOverlay'

const DrawerContent = React.forwardRef<
  React.ComponentRef<typeof VaulDrawer.Content>,
  React.ComponentPropsWithoutRef<typeof VaulDrawer.Content>
>(({ className, children, ...props }, ref) => (
  <DrawerPortal>
    <DrawerOverlay />
    <VaulDrawer.Content
      ref={ref}
      className={cn(
        'fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto max-h-[85vh] flex-col rounded-t-2xl border-t bg-white pb-safe',
        className
      )}
      {...props}
    >
      {/* Drag handle */}
      <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-muted" />
      {children}
    </VaulDrawer.Content>
  </DrawerPortal>
))
DrawerContent.displayName = 'DrawerContent'

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-4 py-3 border-b border-border', className)} {...props} />
)
DrawerHeader.displayName = 'DrawerHeader'

const DrawerTitle = React.forwardRef<
  React.ComponentRef<typeof VaulDrawer.Title>,
  React.ComponentPropsWithoutRef<typeof VaulDrawer.Title>
>(({ className, ...props }, ref) => (
  <VaulDrawer.Title ref={ref} className={cn('text-lg font-semibold', className)} {...props} />
))
DrawerTitle.displayName = 'DrawerTitle'

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-4 border-t border-border mt-auto', className)} {...props} />
)
DrawerFooter.displayName = 'DrawerFooter'

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
}
