'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { formatINR, formatDate } from '@/lib/utils'

export default function CartPage() {
  const queryClient = useQueryClient()

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => api.get('/cart').then(r => r.data),
  })

  const { data: quote } = useQuery({
    queryKey: ['cart', 'quote'],
    queryFn: () => api.post('/checkout/quote').then(r => r.data),
    enabled: (cart?.items?.length || 0) > 0,
    retry: false,
  })

  const removeItem = useMutation({
    mutationFn: (itemId: string) => api.delete(`/cart/items/${itemId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      toast.success('Item removed from cart')
    },
  })

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-8 text-center">Loading cart...</div>

  if (!cart?.items?.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Browse items and add them to your cart</p>
        <Link href="/search" className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90">
          Browse Items
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 pb-36 lg:pb-8">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item: any) => (
            <div key={item.id} className="bg-white border border-border rounded-xl p-4 flex gap-4">
              <div className="w-20 h-20 bg-accent rounded-lg flex-shrink-0 overflow-hidden relative">
                {item.listing?.media?.[0]?.url ? (
                  <Image src={item.listing.media[0].url} alt={item.listing.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No img</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/items/${item.listingId}`} className="font-medium hover:underline line-clamp-1">
                  {item.listing?.title}
                </Link>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.mode === 'RENT' ? 'Rental' : 'Purchase'}
                  {item.mode === 'RENT' && item.startDate && (
                    <> · {formatDate(item.startDate)} – {formatDate(item.endDate)}</>
                  )}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-semibold text-primary">
                    {item.mode === 'RENT'
                      ? `${formatINR(item.listing?.pricing?.rentPriceDaily || 0)}/day`
                      : formatINR(item.listing?.pricing?.buyPrice || 0)}
                  </span>
                  <button
                    onClick={() => removeItem.mutate(item.id)}
                    className="p-1 hover:bg-destructive/10 rounded text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary — desktop sidebar */}
        <div className="hidden lg:block">
          <div className="bg-white border border-border rounded-xl p-6 sticky top-24">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            {quote ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(quote.subtotal)}</span></div>
                <div className="flex justify-between"><span>Security deposits</span><span>{formatINR(quote.depositTotal)}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Platform fee (10%)</span><span>{formatINR(quote.commissionTotal)}</span></div>
                <div className="border-t border-border pt-2 flex justify-between font-bold">
                  <span>Total</span><span>{formatINR(quote.total)}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {[1,2,3,4].map(i => <div key={i} className="h-4 bg-muted rounded animate-pulse" />)}
              </div>
            )}
            <Link
              href="/checkout"
              className="mt-4 block w-full bg-primary text-white py-3 rounded-xl font-medium hover:opacity-90 text-center"
            >
              Proceed to Checkout
            </Link>
            <Link href="/search" className="mt-2 block text-center text-sm text-muted-foreground hover:underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile sticky checkout bar */}
      <div className="fixed bottom-14 left-0 right-0 z-40 bg-white border-t border-border px-4 py-3 lg:hidden pb-safe">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{cart.items.length} item{cart.items.length !== 1 ? 's' : ''}</p>
            <p className="text-lg font-bold">{quote ? formatINR(quote.total) : '...'}</p>
          </div>
          <Link
            href="/checkout"
            className="bg-primary text-white px-6 py-3 rounded-xl font-semibold min-h-[48px] flex items-center"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  )
}
