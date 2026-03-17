import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { ThemeProvider } from '@/components/theme-provider'
import { QueryProvider } from '@/components/query-provider'
import { AuthProvider } from '@/context/AuthContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'INNEED — Rent Anything Near You',
    template: '%s | INNEED',
  },
  description:
    'India\'s peer-to-peer rental marketplace. Rent cameras, tools, furniture, electronics and more from trusted neighbors.',
  keywords: ['rental', 'rent', 'peer-to-peer', 'marketplace', 'India', 'P2P'],
  openGraph: {
    title: 'INNEED — Rent Anything Near You',
    description: 'India\'s peer-to-peer rental marketplace',
    type: 'website',
    locale: 'en_IN',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <QueryProvider>
            <AuthProvider>
              {children}
              <Toaster richColors position="top-right" />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
