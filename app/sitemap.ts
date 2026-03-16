import { MetadataRoute } from 'next'
import { CORRIDORS, PROVIDER_PAIRS } from '@/config/seo-corridors'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://remit-ai-app.vercel.app'

  // 1. Homepage
  const homepage = {
    url: `${baseUrl}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 1.0,
  }

  // 2. Comparison Routes (e.g., /compare/gbp-to-ngn)
  const comparisonRoutes = CORRIDORS.map((c) => ({
    url: `${baseUrl}/compare/${c.from.toLowerCase()}-to-${c.to.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.8,
  }))

  // 3. Review Routes (e.g., /reviews/wise-vs-remitly-nigeria)
  const reviewRoutes = PROVIDER_PAIRS.map((p) => ({
    url: `${baseUrl}/reviews/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  // 4. Rates Routes (e.g., /rates/usd-to-ngn-today)
  const ratesRoutes = CORRIDORS.map((c) => ({
    url: `${baseUrl}/rates/${c.from.toLowerCase()}-to-${c.to.toLowerCase()}-today`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.6,
  }))

  return [homepage, ...comparisonRoutes, ...reviewRoutes, ...ratesRoutes]
}
