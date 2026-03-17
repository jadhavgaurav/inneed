import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About INNEED — India\'s P2P Rental Marketplace',
  description: 'INNEED connects people who need things with people who have them. Rent anything from cameras to bikes across India.',
}

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">About INNEED</h1>
        <p className="text-lg text-muted-foreground">
          India's trusted peer-to-peer rental marketplace — connecting people who need things with people who have them.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 text-center">
        {[
          { emoji: '🤝', title: 'Community First', desc: 'Built on trust between renters and owners, secured by our platform.' },
          { emoji: '♻️', title: 'Sustainable', desc: 'Reduce waste by sharing instead of buying. Good for your wallet and the planet.' },
          { emoji: '🇮🇳', title: 'Made for India', desc: 'Designed for Indian needs, supporting UPI payments and local vendors.' },
        ].map(v => (
          <div key={v.title} className="border border-border rounded-xl p-6">
            <div className="text-4xl mb-3">{v.emoji}</div>
            <h3 className="font-semibold mb-2">{v.title}</h3>
            <p className="text-sm text-muted-foreground">{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Our Story</h2>
        <p className="text-muted-foreground leading-relaxed">
          INNEED was born from a simple observation: most things we own sit idle 90% of the time.
          A camera bought for one trip, a drill used twice a year, a dining table for occasional guests —
          these items represent locked value that could benefit your neighbours and earn you money.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          We built INNEED to unlock that value. Our platform makes it safe and simple for anyone in India
          to rent out their belongings, and for everyone else to access quality items without the cost of ownership.
        </p>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-3">Join thousands of Indians sharing smarter</h2>
        <p className="text-muted-foreground mb-6">List your items and start earning, or find what you need without buying.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/vendor/onboarding" className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:opacity-90">
            Become a Vendor
          </Link>
          <Link href="/search" className="border border-border px-6 py-3 rounded-xl font-medium hover:bg-accent">
            Browse Items
          </Link>
        </div>
      </div>
    </div>
  )
}
