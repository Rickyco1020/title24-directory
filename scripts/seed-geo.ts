/**
 * Seed the geographic tables — counties and cities.
 *
 * Both tables are generated from `lib/california-data.ts`, which is the single
 * source of truth: the city and county pages read that file directly, not these
 * tables. Seeding from anywhere else would create a second list that silently
 * drifts from the one the site actually renders.
 *
 * Idempotent. Upserts on `slug`, so re-running only fills gaps and corrects
 * drift; it never duplicates and never deletes.
 *
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed-geo.ts
 *
 * This script does NOT touch `raters`. Listings are seeded by
 * `scripts/seed-raters.ts`, which has its own rules about `source`.
 */
import { createClient } from '@supabase/supabase-js'
import { CA_COUNTIES, CITIES } from '../lib/california-data'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n' +
      'The service-role key is required — RLS blocks anonymous writes to these tables.'
  )
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

async function seedGeo() {
  const countyRows = CA_COUNTIES.map(({ name, slug }) => ({ name, slug }))
  const { error: countyError } = await supabase
    .from('counties')
    .upsert(countyRows, { onConflict: 'slug' })

  if (countyError) {
    console.error('counties failed:', countyError.message)
    process.exit(1)
  }
  console.log(`counties: ${countyRows.length} upserted`)

  const cityRows = CITIES.map(({ name, slug, county, county_slug }) => ({
    name,
    slug,
    county,
    county_slug,
  }))
  const { error: cityError } = await supabase
    .from('cities')
    .upsert(cityRows, { onConflict: 'slug' })

  if (cityError) {
    console.error('cities failed:', cityError.message)
    process.exit(1)
  }
  console.log(`cities: ${cityRows.length} upserted`)

  const [{ count: counties }, { count: cities }] = await Promise.all([
    supabase.from('counties').select('*', { count: 'exact', head: true }),
    supabase.from('cities').select('*', { count: 'exact', head: true }),
  ])
  console.log(`done — counties: ${counties}, cities: ${cities}`)
}

seedGeo()
