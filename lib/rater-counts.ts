import { supabase } from '@/lib/supabase'

/**
 * Listings per county, tallied in one pass over `counties_served` — the same
 * column the county page filters on, so a number shown anywhere always matches
 * the page it links to.
 *
 * Null on failure rather than an empty map: a Supabase hiccup should make the
 * counts disappear, not tell every county in California it has no raters.
 */
export async function ratersByCounty(): Promise<Map<string, number> | null> {
  const { data, error } = await supabase
    .from('raters')
    .select('counties_served')
    .in('status', ['approved', 'featured'])
  if (error || !data) return null

  const rows = data as { counties_served: string[] | null }[]
  const counts = new Map<string, number>()
  for (const row of rows) {
    for (const slug of row.counties_served ?? []) {
      counts.set(slug, (counts.get(slug) ?? 0) + 1)
    }
  }
  return counts
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
