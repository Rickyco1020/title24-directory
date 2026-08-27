/**
 * Seed listings researched from public sources into `raters`.
 *
 * WHY THIS EXISTS
 * ---------------
 * The original 51 listings were loaded by a one-off script that no longer
 * exists. That left the repo with no reproducible seed path — and the column
 * that matters most, `source`, defaults to 'self'. A re-seed done by hand
 * would therefore write `source = 'self'` rows, and every seeded card would
 * silently lose its "Claim or remove this listing" link, because that link
 * renders only for `source = 'seeded'`.
 *
 * This script exists so that never happens: `source` is forced to 'seeded'
 * here and cannot be overridden by the input file.
 *
 * THE INPUT FILE IS NOT IN THE REPO
 * ---------------------------------
 * Listings carry contact emails and phone numbers, and this repository is
 * public. The seed data lives outside it — pass a path, default
 * `data/raters.seed.json`, which .gitignore excludes.
 *
 * Export the current production rows into that shape with:
 *
 *   select business_name, contact_name, email, phone, website, services,
 *          cities_served, counties_served, description, license_number, status
 *     from raters where source = 'seeded';
 *
 * (Export as JSON from the Supabase SQL editor.)
 *
 * USAGE
 * -----
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     npx tsx scripts/seed-raters.ts [path/to/raters.seed.json] [--dry-run]
 *
 * Idempotent by email: a row whose email already exists is skipped, never
 * updated and never duplicated. Existing listings — including ones a business
 * has since claimed and corrected — are left exactly as they are.
 */
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

type SeedRow = {
  business_name: string
  email: string
  services: string[]
  contact_name?: string | null
  phone?: string | null
  website?: string | null
  cities_served?: string[] | null
  counties_served?: string[] | null
  description?: string | null
  license_number?: string | null
  status?: 'pending' | 'approved' | 'featured'
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n' +
      'The service-role key is required — RLS blocks anonymous writes to raters.'
  )
  process.exit(1)
}

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const file = args.find((a) => !a.startsWith('--')) ?? 'data/raters.seed.json'

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

function parseRows(path: string): SeedRow[] {
  const parsed = JSON.parse(readFileSync(path, 'utf8'))
  if (!Array.isArray(parsed)) throw new Error(`${path} must contain a JSON array`)

  return parsed.map((row, i) => {
    const where = `row ${i + 1}`
    if (!row?.business_name) throw new Error(`${where}: business_name is required`)
    if (!row?.email) throw new Error(`${where}: email is required`)
    if (!Array.isArray(row.services) || row.services.length === 0) {
      throw new Error(`${where} (${row.business_name}): services must be a non-empty array`)
    }
    return row as SeedRow
  })
}

async function seedRaters() {
  const rows = parseRows(file)
  console.log(`${file}: ${rows.length} listings`)

  const { data: existing, error: readError } = await supabase.from('raters').select('email')
  if (readError) {
    console.error('could not read existing listings:', readError.message)
    process.exit(1)
  }

  const known = new Set((existing ?? []).map((r) => String(r.email).toLowerCase()))
  const fresh = rows.filter((r) => !known.has(r.email.toLowerCase()))
  const skipped = rows.length - fresh.length

  if (skipped) console.log(`${skipped} already present by email — skipped`)
  if (fresh.length === 0) {
    console.log('nothing to insert')
    return
  }

  // `source` is set here and deliberately not read from the input file. A
  // seeded listing must be marked as seeded or its claim link disappears.
  const payload = fresh.map((r) => ({
    business_name: r.business_name,
    contact_name: r.contact_name ?? null,
    email: r.email,
    phone: r.phone ?? null,
    website: r.website ?? null,
    services: r.services,
    cities_served: r.cities_served ?? [],
    counties_served: r.counties_served ?? [],
    description: r.description ?? null,
    license_number: r.license_number ?? null,
    status: r.status ?? 'approved',
    source: 'seeded' as const,
  }))

  if (dryRun) {
    console.log(`--dry-run: would insert ${payload.length} listings as source='seeded'`)
    payload.forEach((r) => console.log(`  ${r.business_name} <${r.email}> [${r.status}]`))
    return
  }

  const { data, error } = await supabase.from('raters').insert(payload).select('id')
  if (error) {
    console.error('insert failed:', error.message)
    process.exit(1)
  }
  console.log(`inserted ${data?.length ?? 0} listings as source='seeded'`)

  const { count } = await supabase
    .from('raters')
    .select('*', { count: 'exact', head: true })
    .eq('source', 'seeded')
  console.log(`done — ${count} seeded listings now carry a claim link`)
}

seedRaters()
