import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How It Works — INNEED',
  description: 'Learn how to rent items or list your belongings on INNEED, India\'s P2P rental marketplace.',
}

const renterSteps = [
  { step: '1', title: 'Find what you need', desc: 'Search by category, location, or keyword. Filter by price, condition, and distance.' },
  { step: '2', title: 'Book and pay securely', desc: 'Select your rental dates, add to cart, and pay via Razorpay. Your deposit is held safely.' },
  { step: '3', title: 'Pick up with code', desc: 'Get a unique pickup code. Show it to the vendor to collect your item.' },
  { step: '4', title: 'Return and get deposit back', desc: 'Return the item in good condition and your security deposit is automatically refunded.' },
]

const vendorSteps = [
  { step: '1', title: 'Create your account', desc: 'Sign up and complete vendor onboarding with your business details and documents.' },
  { step: '2', title: 'List your items', desc: 'Add photos, set your daily/weekly rates, and publish your listing in minutes.' },
  { step: '3', title: 'Approve bookings', desc: 'Review rental requests and approve or decline. You\'re always in control.' },
  { step: '4', title: 'Earn money', desc: 'Get paid directly to your account after each successful rental. Track earnings in real time.' },
]

export default function HowItWorksPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">How INNEED Works</h1>
        <p className="text-lg text-muted-foreground">Simple, safe, and transparent for both renters and vendors.</p>
      </div>

      {/* For Renters */}
      <div>
        <h2 className="text-2xl font-bold mb-8 text-center">For Renters</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {renterSteps.map(s => (
            <div key={s.step} className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                {s.step}
              </div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/search" className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:opacity-90">
            Start Browsing
          </Link>
        </div>
      </div>

      <hr className="border-border" />

      {/* For Vendors */}
      <div>
        <h2 className="text-2xl font-bold mb-8 text-center">For Vendors</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {vendorSteps.map(s => (
            <div key={s.step} className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                {s.step}
              </div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/vendor/onboarding" className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:opacity-90">
            Start Earning
          </Link>
        </div>
      </div>

      {/* Trust section */}
      <div className="bg-muted/40 rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-6 text-center">Our Trust & Safety Measures</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { title: 'Verified Vendors', desc: 'All vendors submit ID and business documents reviewed by our team.' },
            { title: 'Secure Payments', desc: 'Powered by Razorpay. Your payment is protected and refunded on disputes.' },
            { title: 'Security Deposits', desc: 'A refundable deposit protects vendors from damage, returned automatically on good returns.' },
          ].map(t => (
            <div key={t.title} className="text-center">
              <h3 className="font-semibold mb-2 text-sm">{t.title}</h3>
              <p className="text-xs text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
