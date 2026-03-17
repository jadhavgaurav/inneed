import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-primary mb-4">INNEED</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Rent Anything Near You — India&apos;s P2P Rental Marketplace
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/search"
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition"
          >
            Browse Items
          </Link>
          <Link
            href="/login"
            className="border border-border px-6 py-3 rounded-lg font-medium hover:bg-accent transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    </main>
  )
}
