import Link from 'next/link'
import { Package, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-1.5 mb-3">
              <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
                <Package className="h-3.5 w-3.5 text-white" />
              </div>
              <p className="font-bold text-primary text-lg leading-none">INNEED</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              India&apos;s trusted P2P rental marketplace. Rent anything, anywhere.
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                <span>support@inneed.in</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Bengaluru, India</span>
              </div>
            </div>
          </div>

          {/* Renters */}
          <div>
            <p className="font-semibold text-sm mb-3">Renters</p>
            <div className="space-y-2">
              <Link href="/search" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Browse Items</Link>
              <Link href="/how-it-works" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
              <Link href="/faq" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
              <Link href="/search?categorySlug=cameras" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Rent Cameras</Link>
              <Link href="/search?categorySlug=electronics" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Rent Electronics</Link>
            </div>
          </div>

          {/* Vendors */}
          <div>
            <p className="font-semibold text-sm mb-3">Vendors</p>
            <div className="space-y-2">
              <Link href="/vendor/onboarding" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Become a Vendor</Link>
              <Link href="/how-it-works#vendors" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">How Earning Works</Link>
              <Link href="/vendor/dashboard" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Vendor Dashboard</Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <p className="font-semibold text-sm mb-3">Company</p>
            <div className="space-y-2">
              <Link href="/about" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">About Us</Link>
              <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
              <Link href="/privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <p className="font-semibold text-sm mb-3">Categories</p>
            <div className="space-y-2">
              <Link href="/search?categorySlug=cameras" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Cameras</Link>
              <Link href="/search?categorySlug=bikes" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Bikes</Link>
              <Link href="/search?categorySlug=tools" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Tools</Link>
              <Link href="/search?categorySlug=furniture" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Furniture</Link>
              <Link href="/search?categorySlug=electronics" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Electronics</Link>
              <Link href="/search?categorySlug=instruments" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Instruments</Link>
            </div>
          </div>
        </div>

        {/* Payment methods + Bottom bar */}
        <div className="border-t border-border pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <p className="text-xs text-muted-foreground">
                © 2026 INNEED Technologies Pvt. Ltd. All rights reserved.
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="bg-accent px-2 py-0.5 rounded text-[10px] font-medium">UPI</span>
                <span className="bg-accent px-2 py-0.5 rounded text-[10px] font-medium">Visa</span>
                <span className="bg-accent px-2 py-0.5 rounded text-[10px] font-medium">Mastercard</span>
                <span className="bg-accent px-2 py-0.5 rounded text-[10px] font-medium">Razorpay</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link href="/privacy" className="hover:underline hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:underline hover:text-foreground transition-colors">Terms</Link>
              <Link href="/contact" className="hover:underline hover:text-foreground transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
