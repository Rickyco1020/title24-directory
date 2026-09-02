import { cache } from 'react'
import { supabase } from '@/lib/supabase'
import { CITIES } from '@/lib/california-data'

/**
 * How many listing cards a city or county page will draw before it stops and
 * links to the paginated directory instead.
 *
 * A city page shows every rater covering its county, so the ceiling on any one
 * page is the county roster — and Los Angeles County alone feeds roughly ninety
 * city pages. Uncapped, the day the roster reaches four figures is the day
 * ninety prerendered documents each carry the whole thing. Fifty cards is well
 * past what anyone scrolls and still a bounded page.
 *
 * Both place pages import this so the two can never drift.
 */
export const PLACE_CARD_LIMIT = 50

/** How many listings each place page will actually render. */
export type PlaceCounts = {
  /** City slug -> raters the city page shows: city-specific plus county-wide. */
  cities: Map<string, number>
  /** County slug -> raters the county page shows. */
  counties: Map<string, number>
}

// Cities grouped by county once, at module load. A rater who covers a county
// covers every city in it — that is what the city page's OR filter returns —
// so the county roster has to fan out across its cities to be counted here.
const CITY_SLUGS_BY_COUNTY: Map<string, string[]> = (() => {
  const byCounty = new Map<string, string[]>()
  for (const city of CITIES) {
    const list = byCounty.get(city.county_slug)
    if (list) list.push(city.slug)
    else byCounty.set(city.county_slug, [city.slug])
  }
  return byCounty
})()

/**
 * Listings per place, tallied in one pass over the approved roster.
 *
 * The tallies mirror each page's own query exactly, so a number shown anywhere
 * matches the page it links to:
 *   - county: raters whose `counties_served` contains the county
 *     (`app/directory/county/[county]/page.tsx` — `.contains(...)`)
 *   - city: raters whose `cities_served` names the city, PLUS raters covering
 *     its county, counted once each
 *     (`app/directory/[city]/page.tsx` — the `.or(cities_served.cs / counties_served.cs)` filter)
 *
 * Null on failure rather than an empty map, so callers decide for themselves
 * what "no data" means. Wrapped in React `cache` so a page that needs the counts
 * in both `generateMetadata` and its body pays for one query, not two.
 */
export const placeListingCounts = cache(async (): Promise<PlaceCounts | null> => {
  const { data, error } = await supabase
    .from('raters')
    .select('cities_served, counties_served')
    .in('status', ['approved', 'featured'])
  if (error || !data) return null

  const rows = data as { cities_served: string[] | null; counties_served: string[] | null }[]
  const cities = new Map<string, number>()
  const counties = new Map<string, number>()

  for (const row of rows) {
    // A rater listing both a city and its county must count once for that city,
    // exactly as the page's OR filter returns the row once — hence the set.
    const citiesCovered = new Set<string>(row.cities_served ?? [])
    for (const countySlug of row.counties_served ?? []) {
      counties.set(countySlug, (counties.get(countySlug) ?? 0) + 1)
      for (const citySlug of CITY_SLUGS_BY_COUNTY.get(countySlug) ?? []) {
        citiesCovered.add(citySlug)
      }
    }
    for (const citySlug of citiesCovered) {
      cities.set(citySlug, (cities.get(citySlug) ?? 0) + 1)
    }
  }
  return { cities, counties }
})

/**
 * Why "no data" counts as "no listings" here.
 *
 * These two predicates decide whether a place page is indexable and whether it
 * appears in the sitemap, and they answer false when the count is missing as
 * well as when it is zero. That is deliberate: the place pages themselves treat
 * a failed query as an empty roster (`const all = raters ?? []`, `raters?.length
 * ?? 0`) and render the "No raters listed yet" state, so a page that renders as
 * empty is also declared empty. The alternative — index on failure — would ship
 * a page saying "no raters listed" while asking Google to index it, which is the
 * exact mismatch this is meant to remove. The cost is that a Supabase outage
 * during a build or an hourly revalidation marks otherwise-good place pages
 * noindex and drops them from the sitemap until the next successful pass; both
 * are self-healing, and `noindex, follow` keeps link equity flowing either way.
 */
export function cityHasListings(counts: PlaceCounts | null, citySlug: string): boolean {
  return (counts?.cities.get(citySlug) ?? 0) > 0
}

export function countyHasListings(counts: PlaceCounts | null, countySlug: string): boolean {
  return (counts?.counties.get(countySlug) ?? 0) > 0
}

/**
 * Listings per county. Derived from the single pass above so the homepage's
 * top-counties list, the county pages and the sitemap can never disagree.
 *
 * Null on failure rather than an empty map: a Supabase hiccup should make the
 * counts disappear, not tell every county in California it has no raters.
 */
export async function ratersByCounty(): Promise<Map<string, number> | null> {
  const counts = await placeListingCounts()
  return counts?.counties ?? null
}

/**
 * Distinct raters covering at least one county in a zone. Counted with an
 * overlap query rather than by summing the per-county numbers, which would
 * count a rater serving four counties in the zone four times.
 */
export async function ratersInZone(countySlugs: readonly string[]): Promise<number | null> {
  if (!countySlugs.length) return 0
  const { count, error } = await supabase
    .from('raters')
    .select('id', { count: 'exact', head: true })
    .in('status', ['approved', 'featured'])
    .overlaps('counties_served', countySlugs as string[])
  if (error) return null
  return count ?? 0
}
