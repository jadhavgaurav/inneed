'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { formatINR } from '@/lib/utils'

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const { data: quote } = useQuery({
    queryKey: ['cart', 'quote'],
    queryFn: () => api.post('/checkout/quote').then(r => r.data),
  })

  const loadRazorpay = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return }
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async () => {
    if (!quote) return
    setIsProcessing(true)

    try {
      // Create order on backend
      const { data: order } = await api.post('/checkout', { pickupAddress: address, notes })

      // Load Razorpay
      const loaded = await loadRazorpay()
      if (!loaded) throw new Error('Razorpay failed to load')

      // Create Razorpay payment order
      const { data: rzpOrder } = await api.post('/payments/create-order',
        { orderId: order.id },
        { headers: { 'X-Idempotency-Key': `checkout-${order.id}` } }
      )

      // Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount * 100,
        currency: 'INR',
        name: 'INNEED',
        description: `Order ${order.orderNumber}`,
        order_id: rzpOrder.razorpayOrderId,
        handler: async (response: any) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            toast.success('Payment successful!')
            router.push(`/orders/${order.id}/confirmation`)
          } catch {
            toast.error('Payment verification failed. Contact support.')
          }
        },
        prefill: {},
        theme: { color: '#f97316' },
        modal: {
          ondismiss: () => setIsProcessing(false),
        },
      })

      rzp.open()
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Checkout failed')
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <div className="space-y-6">
        {/* Delivery/pickup details */}
        <div className="bg-white border border-border rounded-xl p-6 space-y-4">
          <h2 className="font-semibold">Pickup Details</h2>
          <div>
            <label className="block text-sm font-medium mb-1">Your Address (optional)</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Your address for pickup coordination"
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notes for vendor (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any special instructions..."
              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
        </div>

        {/* Order total */}
        {quote && (
          <div className="bg-white border border-border rounded-xl p-6">
            <h2 className="font-semibold mb-4">Order Total</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(quote.subtotal)}</span></div>
              <div className="flex justify-between"><span>Security deposits</span><span>{formatINR(quote.depositTotal)}</span></div>
              <div className="flex justify-between text-muted-foreground"><span>Platform fee (10%)</span><span>{formatINR(quote.commissionTotal)}</span></div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-base">
                <span>Total</span><span>{formatINR(quote.total)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment methods info */}
        <div className="bg-accent rounded-xl p-4 text-sm text-muted-foreground">
          Secure payment via Razorpay · UPI, Cards, Net Banking, Wallets accepted
        </div>

        <button
          onClick={handlePayment}
          disabled={isProcessing || !quote}
          className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:opacity-90 disabled:opacity-50 text-lg"
        >
          {isProcessing ? 'Processing...' : `Pay ${quote ? formatINR(quote.total) : '...'}`}
        </button>
      </div>
    </div>
  )
}
