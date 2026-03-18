import { MetadataRoute } from 'next'
import { CORRIDORS, PROVIDER_PAIRS } from '@/config/seo-corridors'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://remitaiapp.com'

  // 1. Static Routes & Configurations
  const homepage = {
    url: `${baseUrl}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 1.0,
  }

  const comparisonRoutes = CORRIDORS.map((c) => ({
    url: `${baseUrl}/compare/${c.from.toLowerCase()}-to-${c.to.toLowerCase()}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.8,
  }))

  const reviewRoutes = PROVIDER_PAIRS.map((p) => ({
    url: `${baseUrl}/reviews/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  const ratesRoutes = CORRIDORS.map((c) => ({
    url: `${baseUrl}/rates/${c.from.toLowerCase()}-to-${c.to.toLowerCase()}-today`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.6,
  }))

  // 2. Dynamic SEO Guide Routes
  let seoGuideRoutes: MetadataRoute.Sitemap = []
  try {
    const { data: guides } = await supabase
      .from('seo_guides')
      .select('slug, created_at')
      .eq('is_published', true)

    if (guides) {
      seoGuideRoutes = guides.map((guide) => ({
        url: `${baseUrl}/send-money/${guide.slug}`,
        lastModified: new Date(guide.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    }
  } catch (error) {
    console.error('Sitemap SEO guides fetch error:', error)
    // Continue without dynamic routes if fetch fails
  }

  return [homepage, ...comparisonRoutes, ...reviewRoutes, ...ratesRoutes, ...seoGuideRoutes]
}
