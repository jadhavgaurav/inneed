import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin, Camera, Bike, Wrench, Sofa, Laptop, Music,
  ShieldCheck, CreditCard, Headphones, Building2, ArrowRight,
  Star, TrendingUp, Users, Package, IndianRupee, Clock,
  CheckCircle, Zap, Heart,
} from 'lucide-react'
import { NewsletterForm } from '@/components/newsletter-form'

const CATEGORIES = [
  {
    icon: Camera,
    name: 'Cameras',
    slug: 'cameras',
    bg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    desc: 'DSLRs, lenses & more',
  },
  {
    icon: Bike,
    name: 'Bikes',
    slug: 'bikes',
    bg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    desc: 'Cycles, scooters & more',
  },
  {
    icon: Wrench,
    name: 'Tools',
    slug: 'tools',
    bg: 'bg-green-50',
    iconColor: 'text-green-600',
    desc: 'Power tools & equipment',
  },
  {
    icon: Sofa,
    name: 'Furniture',
    slug: 'furniture',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    desc: 'Tables, chairs & sofas',
  },
  {
    icon: Laptop,
    name: 'Electronics',
    slug: 'electronics',
    bg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    desc: 'Laptops, gadgets & more',
  },
  {
    icon: Music,
    name: 'Instruments',
    slug: 'instruments',
    bg: 'bg-pink-50',
    iconColor: 'text-pink-600',
    desc: 'Guitars, keyboards & more',
  },
]

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Verified Vendors', desc: 'All vendors are KYC verified' },
  { icon: CreditCard, label: 'Secure Payments', desc: 'Razorpay-powered transactions' },
  { icon: Headphones, label: '7-Day Support', desc: 'Help available all week' },
  { icon: Building2, label: '500+ Cities', desc: 'Pan-India coverage' },
]

const STATS = [
  { icon: Users, value: '25,000+', label: 'Active Users' },
  { icon: Package, value: '15,000+', label: 'Items Listed' },
  { icon: IndianRupee, value: '2.5 Cr+', label: 'Earned by Vendors' },
  { icon: Star, value: '4.8', label: 'Avg Rating' },
]

const TESTIMONIALS = [
  {
    name: 'Arjun M.',
    city: 'Bengaluru',
    text: 'Rented a DSLR camera for my trip to Hampi. Saved me thousands compared to buying one. The vendor was super helpful with tips!',
    rating: 5,
    avatar: 'A',
  },
  {
    name: 'Meera S.',
    city: 'Mumbai',
    text: 'I list my power tools on INNEED when I\'m not using them. Earned over ₹15,000 last month just from my drill set and sander!',
    rating: 5,
    avatar: 'M',
  },
  {
    name: 'Ravi K.',
    city: 'Delhi',
    text: 'Needed furniture for my 3-month internship. Rented a full bedroom set for a fraction of the buying cost. Returning was seamless.',
    rating: 5,
    avatar: 'R',
  },
]

const WHY_CHOOSE = [
  {
    icon: Zap,
    title: 'Instant Booking',
    desc: 'Browse, book, and pickup in minutes. No lengthy paperwork or waiting periods.',
  },
  {
    icon: ShieldCheck,
    title: 'Damage Protection',
    desc: 'Security deposits protect vendors. Fair dispute resolution if anything goes wrong.',
  },
  {
    icon: Heart,
    title: 'Sustainable Living',
    desc: 'Reduce waste by sharing instead of buying. Good for your wallet and the planet.',
  },
  {
    icon: IndianRupee,
    title: 'Best Prices',
    desc: 'Rent for 10-20% of the purchase price. Compare vendors and find the best deal.',
  },
]

async function getFeaturedListings() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/listings?limit=8`,
      { cache: 'no-store' }
    )
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

      {/* ── Hero ── */}
      <section className="relative bg-gradient-to-br from-primary/12 via-primary/6 to-secondary overflow-hidden py-10 sm:py-20 px-4">
        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-primary/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-white/80 border border-primary/20 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-5 shadow-sm">
            <Star className="h-3.5 w-3.5 fill-current" />
            India&apos;s #1 P2P Rental Marketplace
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 tracking-tight text-foreground leading-tight">
            Rent Anything<br className="hidden sm:block" /> Near You
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8 max-w-xl mx-auto">
            Save money, reduce waste, and earn from items you own.
            Trusted by thousands across India.
          </p>

          {/* Quick category pills */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Popular:</span>
            {CATEGORIES.slice(0, 4).map(({ name, slug }) => (
              <Link
                key={slug}
                href={`/search?categorySlug=${slug}`}
                className="text-xs bg-white/80 border border-border hover:border-primary/40 hover:text-primary px-3 py-1 rounded-full transition-colors font-medium"
              >
                {name}
              </Link>
            ))}
            <Link
              href="/search"
              className="text-xs text-primary font-medium hover:underline flex items-center gap-0.5"
            >
              More <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Location note */}
          <div className="mt-4 flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            <span>Items available across India&apos;s major cities</span>
          </div>
        </div>
      </section>

      {/* ── Trust Badges ── */}
      <section className="border-b border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex sm:grid sm:grid-cols-4 gap-3 overflow-x-auto sm:overflow-visible" style={{ scrollbarWidth: 'none' }}>
            {TRUST_BADGES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 py-1 flex-shrink-0 min-w-[200px] sm:min-w-0">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4.5 w-4.5 text-primary" style={{ width: '18px', height: '18px' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">{label}</p>
                  <p className="text-xs text-muted-foreground leading-tight">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform Stats (like Flipkart/Meesho social proof) ── */}
      <section className="bg-gradient-to-r from-primary/5 to-primary/2 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="text-center">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full mb-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse by Category ── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Browse by Category</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Find what you need from thousands of listings</p>
          </div>
          <Link href="/search" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
          {CATEGORIES.map(({ icon: Icon, name, slug, bg, iconColor, desc }) => (
            <Link
              key={slug}
              href={`/search?categorySlug=${slug}`}
              className="group flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl border border-border bg-white hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer text-center"
            >
              <div className={`w-10 h-10 sm:w-14 sm:h-14 ${bg} rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                <Icon className={`h-5 w-5 sm:h-7 sm:w-7 ${iconColor}`} />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight">{name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-tight hidden sm:block">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Items ── */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Featured Items</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Handpicked rentals near you</p>
            </div>
            <Link href="/search" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none' }}>
            {featured.map((listing: any) => (
              <div key={listing.id} className="flex-shrink-0 w-[160px] sm:w-auto">
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Why Choose INNEED ── */}
      <section className="bg-white border-y border-border py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">Why Choose INNEED?</h2>
            <p className="text-sm text-muted-foreground mt-1">Everything you need for a seamless rental experience</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {WHY_CHOOSE.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-accent/60 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-2">How INNEED Works</h2>
          <p className="text-muted-foreground mb-10 text-sm">Get started in 3 simple steps</p>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Browse & Search',
                desc: 'Find items near you with smart filters and map view',
              },
              {
                step: '2',
                title: 'Book & Pay',
                desc: 'Secure payment with Razorpay. Deposits handled safely',
              },
              {
                step: '3',
                title: 'Pickup & Return',
                desc: 'Meet vendor, use the item, return in same condition',
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center relative">
                <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 shadow-md">
                  {step}
                </div>
                <h3 className="font-semibold mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">{desc}</p>
              </div>
            ))}
          </div>
          <Link
            href="/how-it-works"
            className="mt-10 inline-flex items-center gap-1.5 text-primary font-medium hover:underline"
          >
            Learn more <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ── Testimonials (like Amazon/Flipkart reviews) ── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">What Our Users Say</h2>
          <p className="text-sm text-muted-foreground mt-1">Join thousands of happy renters and vendors</p>
        </div>
        <div className="flex sm:grid sm:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto sm:overflow-visible -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none' }}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-white border border-border rounded-2xl p-5 sm:p-6 hover:shadow-md transition-shadow flex-shrink-0 w-[280px] sm:w-auto">
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {t.city}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Vendor CTA Banner ── */}
      <section className="max-w-7xl mx-auto px-4 py-4 pb-12">
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          {/* Decorative */}
          <div className="absolute right-0 top-0 w-64 h-full bg-white/5 rounded-l-full pointer-events-none" />
          <div className="absolute right-20 top-0 w-40 h-full bg-white/5 rounded-l-full pointer-events-none" />

          <div className="relative text-white">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5" />
              <span className="text-sm font-medium text-white/80">Earn Money</span>
            </div>
            <h3 className="text-2xl font-bold mb-1">Have items lying around?</h3>
            <p className="text-white/80 text-sm max-w-sm">
              List your cameras, tools, bikes and more. Start earning from things you already own.
            </p>
          </div>
          <div className="relative flex-shrink-0 flex flex-col sm:flex-row gap-3">
            <Link
              href="/vendor/onboarding"
              className="bg-white text-primary px-6 py-3 rounded-xl font-semibold text-sm hover:bg-white/95 transition-colors shadow-sm text-center"
            >
              List Your First Item
            </Link>
            <Link
              href="/how-it-works#vendors"
              className="border border-white/40 text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-white/10 transition-colors text-center"
            >
              How Earning Works
            </Link>
          </div>
        </div>
      </section>

      {/* ── Download / Newsletter CTA ── */}
      <section className="border-t border-border bg-accent/40 py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Clock className="h-3.5 w-3.5" />
            Coming Soon
          </div>
          <h2 className="text-2xl font-bold mb-2">INNEED Mobile App</h2>
          <p className="text-muted-foreground mb-6 text-sm">
            Get notified when our mobile app launches. Rent and list items on the go with instant notifications.
          </p>
          <NewsletterForm />
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Free to use
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle className="h-3.5 w-3.5 text-green-500" /> No spam
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle className="h-3.5 w-3.5 text-green-500" /> Unsubscribe anytime
            </div>
          </div>
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
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
            No image
          </div>
        )}
        {listing.pricing?.averageRating > 0 && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm text-xs px-1.5 py-0.5 rounded-full font-medium flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {listing.pricing.averageRating.toFixed(1)}
          </div>
        )}
      </div>
      <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">{listing.title}</h3>
      {price && (
        <p className="text-primary font-semibold text-sm">
          ₹{price.toLocaleString('en-IN')}<span className="text-muted-foreground font-normal">/day</span>
        </p>
      )}
    </Link>
  )
}
