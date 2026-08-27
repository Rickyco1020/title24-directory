import { MetadataRoute } from 'next'
import { CITIES, CA_COUNTIES } from '@/lib/california-data'
import { SITE_URL } from '@/lib/site'
import { supabase } from '@/lib/supabase'

const BASE_URL = SITE_URL

// One timestamp per generation. Stamping `new Date()` on each of the ~540 static
// place URLs tells Google every page changed on every rebuild, which is false —
// and lastmod that is observably unreliable gets ignored wholesale.
const GENERATED_AT = new Date()

const articles = [
  'what-is-a-hers-rater',
  'cf2r-vs-cf3r',
  'title-24-compliance-guide',
  'what-is-acceptance-testing',
  'hers-vs-ecc-rater',
  'title-24-solar-requirements',
  'what-is-a-cf1r',
  'duct-leakage-testing',
  'heat-pump-water-heater-title-24',
  'performance-path-title-24',
  'hvac-replacement-hers-rater',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cityPages = CITIES.map(city => ({
    url: `${BASE_URL}/directory/${city.slug}`,
    lastModified: GENERATED_AT,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  const countyPages = CA_COUNTIES.map(county => ({
    url: `${BASE_URL}/directory/county/${county.slug}`,
    lastModified: GENERATED_AT,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  const articlePages = articles.map(slug => ({
    url: `${BASE_URL}/resources/${slug}`,
    lastModified: GENERATED_AT,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const corePages = [
    { url: BASE_URL, lastModified: GENERATED_AT, changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${BASE_URL}/directory`, lastModified: GENERATED_AT, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${BASE_URL}/get-listed`, lastModified: GENERATED_AT, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${BASE_URL}/resources`, lastModified: GENERATED_AT, changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: GENERATED_AT, changeFrequency: 'monthly' as const, priority: 0.5 },
  ]

  // Rater detail pages exist and render, but nothing linked to them and they
  // were missing here, so they were unreachable. Listed last; failures are
  // swallowed so a Supabase hiccup degrades the sitemap instead of breaking it.
  let raterPages: MetadataRoute.Sitemap = []
  try {
    const { data, error } = await supabase
      .from('raters')
      .select('id, created_at')
      .in('status', ['approved', 'featured'])
      // Supabase truncates at db-max-rows without saying so. 50k is the sitemap
      // spec's own per-file limit, so anything past it needs a split anyway.
      .range(0, 49_999)
    if (error) throw error
    raterPages = (data ?? []).map((r: { id: string; created_at?: string | null }) => ({
      url: `${BASE_URL}/directory/rater/${r.id}`,
      lastModified: r.created_at ? new Date(r.created_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch {
    raterPages = []
  }

  return [...corePages, ...countyPages, ...cityPages, ...articlePages, ...raterPages]
}
