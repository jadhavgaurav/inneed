import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, MapPin, Camera, Bike, Wrench, Sofa, Laptop, Music } from 'lucide-react'
import { api } from '@/lib/api'

const CATEGORIES = [
  { icon: Camera, name: 'Cameras', slug: 'cameras', color: 'bg-purple-100 text-purple-600' },
  { icon: Bike, name: 'Bikes', slug: 'bikes', color: 'bg-blue-100 text-blue-600' },
  { icon: Wrench, name: 'Tools', slug: 'tools', color: 'bg-green-100 text-green-600' },
  { icon: Sofa, name: 'Furniture', slug: 'furniture', color: 'bg-purple-100 text-purple-600' },
  { icon: Laptop, name: 'Electronics', slug: 'electronics', color: 'bg-yellow-100 text-yellow-600' },
  { icon: Music, name: 'Instruments', slug: 'instruments', color: 'bg-pink-100 text-pink-600' },
]

async function getFeaturedListings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/listings?limit=8`, {
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.listings || []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const featured = await getFeaturedListings()

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-purple-50 to-purple-100 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Rent Anything Near You
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            India&apos;s trusted P2P rental marketplace. Save money, reduce waste, earn from your items.
          </p>
          <form action="/search" className="flex gap-2 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                name="q"
                placeholder="What do you need? (camera, bike, drill...)"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-border text-base focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
            </div>
            <button type="submit" className="bg-primary text-white px-6 py-3 rounded-xl font-medium hover:opacity-90">
              Search
            </button>
          </form>
          <div className="mt-4 flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Items available across India&apos;s major cities</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {CATEGORIES.map(({ icon: Icon, name, slug, color }) => (
            <Link
              key={slug}
              href={`/search?categorySlug=${slug}`}
              className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-accent transition"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium">{name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Listings */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Items</h2>
            <Link href="/search" className="text-primary text-sm font-medium hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((listing: any) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-accent py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-10">How INNEED Works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Browse & Search', desc: 'Find items near you with smart filters and map view' },
              { step: '2', title: 'Book & Pay', desc: 'Secure payment with Razorpay. Deposits handled safely' },
              { step: '3', title: 'Pickup & Return', desc: 'Meet vendor, use the item, return in same condition' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center">
                <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mb-3">{step}</div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
          <Link href="/how-it-works" className="mt-8 inline-block text-primary font-medium hover:underline">Learn more →</Link>
        </div>
      </section>
    </div>
  )
}

function ListingCard({ listing }: { listing: any }) {
  const primaryImage = listing.media?.[0]
  const price = listing.pricing?.rentPriceDaily

  return (
    <Link href={`/items/${listing.id}`} className="group">
      <div className="aspect-[4/3] bg-accent rounded-xl overflow-hidden mb-3 relative">
        {primaryImage ? (
          <Image
            src={primaryImage.url || '/placeholder.jpg'}
            alt={listing.title}
            fill
            className="object-cover group-hover:scale-105 transition"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No image</div>
        )}
      </div>
      <h3 className="font-medium text-sm line-clamp-2 mb-1">{listing.title}</h3>
      <div className="flex items-center gap-1">
        {listing.pricing?.averageRating > 0 && (
          <span className="text-xs text-amber-500">★ {listing.pricing.averageRating.toFixed(1)}</span>
        )}
      </div>
      {price && (
        <p className="text-primary font-semibold text-sm mt-1">
          ₹{price.toLocaleString('en-IN')}/day
        </p>
      )}
    </Link>
  )
}
