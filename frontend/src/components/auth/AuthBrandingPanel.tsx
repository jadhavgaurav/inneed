'use client'

import { useEffect, useState, useCallback } from 'react'
import { Package, Users, ShieldCheck, Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'

const testimonials = [
  {
    quote: 'I rented a DSLR for my trip to Manali and saved thousands. The process was seamless and the owner was super helpful!',
    name: 'Priya Sharma',
    location: 'Delhi, India',
    initials: 'PS',
  },
  {
    quote: 'Needed a projector for a one-day office presentation. Got it delivered same day at a fraction of the buying cost. Amazing service!',
    name: 'Arjun Mehta',
    location: 'Mumbai, India',
    initials: 'AM',
  },
  {
    quote: 'Rented camping gear for a weekend trek. Everything was in perfect condition. Will definitely use INNEED again.',
    name: 'Sneha Reddy',
    location: 'Bangalore, India',
    initials: 'SR',
  },
  {
    quote: 'As a vendor, I have earned over 50K by renting out my camera equipment. INNEED made it so easy to list and manage bookings.',
    name: 'Karan Patel',
    location: 'Ahmedabad, India',
    initials: 'KP',
  },
]

export function AuthBrandingPanel() {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % testimonials.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)
  }, [])

  // Auto-scroll every 5s
  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  const t = testimonials[current]

  return (
    <div className="hidden md:flex md:w-1/2 lg:w-[45%] flex-col justify-between p-10 lg:p-14 bg-muted/40 border-r border-border relative overflow-hidden">
      {/* Subtle decorative accent — thin gradient strip at left edge */}
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary via-purple-400 to-primary/20" />

      {/* Content */}
      <div className="space-y-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground">INNEED</span>
        </div>

        {/* Tagline */}
        <div className="space-y-3 pt-4">
          <h2 className="text-3xl lg:text-4xl font-bold leading-tight text-foreground">
            Rent anything,
            <br />
            <span className="text-primary">save thousands.</span>
          </h2>
          <p className="text-muted-foreground text-base lg:text-lg max-w-sm leading-relaxed">
            India&apos;s trusted peer-to-peer rental marketplace. From cameras to cars — safe, affordable, local.
          </p>
        </div>

        {/* Trust stats */}
        <div className="flex gap-8 pt-2">
          <div>
            <p className="text-2xl font-bold text-foreground">25K+</p>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Users className="h-3 w-3" /> Users
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">500+</p>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Verified
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">4.8</p>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <Star className="h-3 w-3" /> Rating
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials carousel */}
      <div className="mt-auto pt-8 space-y-3">
        <div className="bg-white rounded-xl border border-border p-5 shadow-sm min-h-[160px] flex flex-col justify-between transition-all duration-300">
          <div>
            <Quote className="h-4 w-4 text-primary/40 mb-2" />
            <p
              key={current}
              className="text-sm text-foreground/80 leading-relaxed animate-in fade-in duration-300"
            >
              &ldquo;{t.quote}&rdquo;
            </p>
          </div>
          <div className="mt-3 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-semibold">
              {t.initials}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{t.name}</p>
              <p className="text-xs text-muted-foreground">{t.location}</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Dots */}
          <div className="flex gap-1.5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  i === current ? 'w-6 bg-primary' : 'w-1.5 bg-border hover:bg-muted-foreground/40'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="flex gap-1">
            <button
              onClick={prev}
              className="h-7 w-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors cursor-pointer"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={next}
              className="h-7 w-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors cursor-pointer"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
