import Header from '@/components/layout/Header'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © 2024 INNEED · <a href="/about" className="hover:underline">About</a> · <a href="/faq" className="hover:underline">FAQ</a>
      </footer>
    </div>
  )
}
