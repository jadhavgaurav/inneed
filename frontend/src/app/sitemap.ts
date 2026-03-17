import type { MetadataRoute } from 'next'

const BASE = process.env.NEXT_PUBLIC_APP_URL || 'https://inneed.in'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1 },
    { url: `${BASE}/search`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${BASE}/how-it-works`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
    { url: `${BASE}/faq`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
  ]
  return staticRoutes
}
