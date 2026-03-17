import Header from '@/components/layout/Header'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="font-bold text-primary text-lg mb-3">INNEED</p>
              <p className="text-sm text-muted-foreground">India's trusted P2P rental marketplace. Rent anything, anywhere.</p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3">Renters</p>
              <div className="space-y-2">
                <a href="/search" className="block text-sm text-muted-foreground hover:text-foreground">Browse Items</a>
                <a href="/how-it-works" className="block text-sm text-muted-foreground hover:text-foreground">How It Works</a>
                <a href="/faq" className="block text-sm text-muted-foreground hover:text-foreground">FAQ</a>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3">Vendors</p>
              <div className="space-y-2">
                <a href="/vendor/onboarding" className="block text-sm text-muted-foreground hover:text-foreground">Become a Vendor</a>
                <a href="/how-it-works#vendors" className="block text-sm text-muted-foreground hover:text-foreground">How Earning Works</a>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3">Company</p>
              <div className="space-y-2">
                <a href="/about" className="block text-sm text-muted-foreground hover:text-foreground">About Us</a>
                <a href="/contact" className="block text-sm text-muted-foreground hover:text-foreground">Contact</a>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">© 2026 INNEED Technologies Pvt. Ltd. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
