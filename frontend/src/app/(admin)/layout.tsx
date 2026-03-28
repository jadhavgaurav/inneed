import Header from '@/components/layout/Header'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-muted/20">
      <Header />
      <main className="flex-1">{children}</main>
    </div>
  )
}
