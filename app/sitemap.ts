import { MetadataRoute } from 'next'
import { CITIES, CA_COUNTIES } from '@/lib/california-data'
import { CZ_NUMBERS } from '@/lib/zone-map'
import { countiesForZone } from '@/lib/climate-zones'
import { SITE_URL } from '@/lib/site'
import { supabase } from '@/lib/supabase'
import { cityHasListings, countyHasListings, placeListingCounts } from '@/lib/rater-counts'
import { RESOURCE_DATES } from '@/lib/resource-dates'
import { LEGAL_UPDATED } from '@/lib/legal-dates'

const BASE_URL = SITE_URL

// Regenerate from live data every hour. Without this the route was rendered
// once at build time and frozen: listings approved after a deploy never reached
// the sitemap (108 rater URLs against 112 live listings on 2026-11-17), and
// every non-rater URL carried the build's own timestamp as its lastmod.
// Approving a listing now adds its URL within the hour, with no deploy.
export const revalidate = 3600

type RaterRow = {
  id: string
  created_at?: string | null
  admin_edited_at?: string | null
  /** Not a column today; honoured if one is ever added. */
  updated_at?: string | null
  cities_served?: string[] | null
  counties_served?: string[] | null
}

function latest(...dates: (Date | undefined)[]): Date | undefined {
  let max: Date | undefined
  for (const d of dates) if (d && (!max || d > max)) max = d
  return max
}

function parse(value?: string | null): Date | undefined {
  if (!value) return undefined
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d
}

/** The most recent real change to a listing: an edit if there was one, else when it was created. */
function raterDate(r: RaterRow): Date | undefined {
  return latest(parse(r.updated_at), parse(r.admin_edited_at), parse(r.created_at))
}

const CITY_SLUGS_BY_COUNTY: Map<string, string[]> = (() => {
  const byCounty = new Map<string, string[]>()
  for (const city of CITIES) {
    const list = byCounty.get(city.county_slug)
    if (list) list.push(city.slug)
    else byCounty.set(city.county_slug, [city.slug])
  }
  return byCounty
})()

function bump(map: Map<string, Date>, key: string, date: Date) {
  const current = map.get(key)
  if (!current || date > current) map.set(key, date)
}

/**
 * Every lastmod below is a date read from a record, or it is left out.
 * A missing lastmod is honest; one batch timestamp on 480 URLs is a claim that
 * they all changed together, which Google can check and then stops trusting.
 */
function entry(
  path: string,
  changeFrequency: 'weekly' | 'monthly' | 'yearly',
  priority: number,
  lastModified?: Date,
): MetadataRoute.Sitemap[number] {
  return {
    url: `${BASE_URL}${path}`,
    ...(lastModified ? { lastModified } : {}),
    changeFrequency,
    priority,
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Every published listing, in one bounded read. '*' rather than named
  // columns: admin_edited_at only exists once migration 006 has run, and
  // naming a missing column fails the whole query.
  let raters: RaterRow[] = []
  const { data, error } = await supabase
    .from('raters')
    .select('*')
    .in('status', ['approved', 'featured'])
    .order('id', { ascending: true })
    // Supabase truncates at db-max-rows without saying so. 50k is the sitemap
    // spec's own per-file limit, so anything past it needs a split anyway.
    .range(0, 49_999)
  if (error) {
    // During `next build` a database we cannot reach must not fail the deploy,
    // so the build degrades to a sitemap with no listings and the first hourly
    // pass repairs it. Once live, throwing is the safer answer: a failed
    // revalidation keeps serving the last good sitemap instead of replacing it
    // with one that has silently dropped every rater.
    if (process.env.NEXT_PHASE !== 'phase-production-build') {
      throw new Error(`sitemap: raters query failed: ${error.message}`)
    }
  } else {
    raters = (data ?? []) as RaterRow[]
  }

  // A place page shows the raters covering it, so the page last changed when
  // the newest of those listings did. Same fan-out as lib/rater-counts.ts: a
  // rater covering a county is rendered on every city page in that county.
  const countyDates = new Map<string, Date>()
  const cityDates = new Map<string, Date>()
  let newestListing: Date | undefined
  for (const r of raters) {
    const date = raterDate(r)
    if (!date) continue
    newestListing = latest(newestListing, date)
    const citiesCovered = new Set<string>(r.cities_served ?? [])
    for (const countySlug of r.counties_served ?? []) {
      bump(countyDates, countySlug, date)
      for (const citySlug of CITY_SLUGS_BY_COUNTY.get(countySlug) ?? []) citiesCovered.add(citySlug)
    }
    for (const citySlug of citiesCovered) bump(cityDates, citySlug, date)
  }

  // A place with no listings is asked not to be indexed by its own
  // generateMetadata, so listing it here would be a sitemap contradicting the
  // page it points at. Same helper as the two page files, so the two decisions
  // cannot drift apart.
  const counts = await placeListingCounts()

  const cityPages = CITIES.filter(city => cityHasListings(counts, city.slug)).map(city =>
    entry(`/directory/${city.slug}`, 'weekly', 0.7, cityDates.get(city.slug)),
  )

  const countyPages = CA_COUNTIES.filter(county => countyHasListings(counts, county.slug)).map(county =>
    entry(`/directory/county/${county.slug}`, 'weekly', 0.7, countyDates.get(county.slug)),
  )

  // Sixteen climate-zone pages. A zone page counts the raters covering any of
  // its counties, so its date is the newest listing among those counties; a
  // zone nobody covers yet has no date to give.
  const zonePages = CZ_NUMBERS.map(zone => {
    const { full, partial } = countiesForZone(zone)
    const date = latest(...[...full, ...partial].map(slug => countyDates.get(slug)))
    return entry(`/directory/zone/${zone}`, 'weekly', 0.7, date)
  })

  const articlePages = Object.entries(RESOURCE_DATES).map(([slug, dates]) =>
    entry(`/resources/${slug}`, 'monthly', 0.6, parse(dates.updated) ?? parse(dates.published)),
  )
  const newestArticle = latest(...Object.values(RESOURCE_DATES).map(d => parse(d.updated)))

  const corePages = [
    // The homepage and the directory both print the live listing count, so the
    // newest listing is when they last changed.
    entry('', 'weekly', 1.0, newestListing),
    entry('/directory', 'weekly', 0.9, newestListing),
    entry('/resources', 'monthly', 0.6, newestArticle),
    // No record behind these, so no lastmod.
    entry('/get-listed', 'monthly', 0.5),
    entry('/contact', 'yearly', 0.3),
    // Low priority, rarely changing, but they have to be here: an ad network
    // reviewing the site looks for a discoverable privacy policy. Dated from
    // the "Last updated" line each page prints.
    entry('/privacy', 'yearly', 0.2, parse(LEGAL_UPDATED.privacy)),
    entry('/terms', 'yearly', 0.2, parse(LEGAL_UPDATED.terms)),
  ]

  // Exactly one URL per published listing. The page's own canonical is this
  // same URL and it is never noindexed, so nothing here contradicts the page.
  const raterPages = raters.map(r => entry(`/directory/rater/${r.id}`, 'weekly', 0.7, raterDate(r)))

  return [...corePages, ...zonePages, ...countyPages, ...cityPages, ...articlePages, ...raterPages]
}
