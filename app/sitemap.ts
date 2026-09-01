import { MetadataRoute } from 'next'
import { CITIES, CA_COUNTIES } from '@/lib/california-data'
import { CZ_NUMBERS } from '@/components/CaliforniaClimateZones'
import { SITE_URL } from '@/lib/site'
import { supabase } from '@/lib/supabase'
import { cityHasListings, countyHasListings, placeListingCounts } from '@/lib/rater-counts'

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
  // A place with no listings is asked not to be indexed by its own
  // generateMetadata, so listing it here would be a sitemap contradicting the
  // page it points at — and `changeFrequency: 'daily'` on a page that never
  // changes is a claim Google can check and hold against the whole site. Same
  // helper as the two page files, so the two decisions cannot drift apart.
  const counts = await placeListingCounts()

  const cityPages = CITIES.filter(city => cityHasListings(counts, city.slug)).map(city => ({
    url: `${BASE_URL}/directory/${city.slug}`,
    lastModified: GENERATED_AT,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  const countyPages = CA_COUNTIES.filter(county => countyHasListings(counts, county.slug)).map(county => ({
    url: `${BASE_URL}/directory/county/${county.slug}`,
    lastModified: GENERATED_AT,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Sixteen climate-zone pages. They sit above the counties in priority: a
  // zone page is the entry point the homepage map points at, and it links on
  // to every county and city inside it.
  const zonePages = CZ_NUMBERS.map(zone => ({
    url: `${BASE_URL}/directory/zone/${zone}`,
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
      lastModified: r.created_at ? new Date(r.created_at) : GENERATED_AT,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))
  } catch {
    raterPages = []
  }

  return [...corePages, ...zonePages, ...countyPages, ...cityPages, ...articlePages, ...raterPages]
}
