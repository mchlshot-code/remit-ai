import { NextResponse } from 'next/server'
import { CORRIDORS, PROVIDER_PAIRS } from '@/config/seo-corridors'
import { POPULAR_CORRIDORS } from '@/config/corridors'
import { supabase } from '@/lib/supabase'

export const revalidate = 0;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://remitaiapp.com'

  // Fetch dynamic guides
  let guides: { slug: string; created_at: string }[] = []
  try {
    const { data } = await supabase
      .from('seo_guides')
      .select('slug, created_at')
      .eq('is_published', true)
    
    if (data) guides = data
  } catch (error) {
    console.error('Sitemap SEO guides fetch error:', error)
  }

  // Combine all routes
  const urls = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'hourly', priority: 1.0 },
    ...CORRIDORS.map((c) => ({ url: `${baseUrl}/compare/${c.from.toLowerCase()}-to-${c.to.toLowerCase()}`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.8 })),
    ...POPULAR_CORRIDORS.map((c) => ({ url: `${baseUrl}/corridors/${c.from.toLowerCase()}-to-${c.to.toLowerCase()}`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.7 })),
    ...PROVIDER_PAIRS.map((p) => ({ url: `${baseUrl}/reviews/${p.slug}`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 })),
    ...CORRIDORS.map((c) => ({ url: `${baseUrl}/rates/${c.from.toLowerCase()}-to-${c.to.toLowerCase()}-today`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.6 })),
    ...guides.map((guide) => ({ url: `${baseUrl}/send-money/${guide.slug}`, lastModified: new Date(guide.created_at), changeFrequency: 'weekly', priority: 0.8 }))
  ]

  // Generate XML with XSL stylesheet attached
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.url}</loc>
    <lastmod>${u.lastModified.toISOString()}</lastmod>
    <changefreq>${u.changeFrequency}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(sitemapXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0'
    },
  })
}
