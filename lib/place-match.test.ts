// Regression suite for the directory search resolver.
//
// Run: npx tsx lib/place-match.test.ts   (from the repo root)
//
// No test framework and no database: every assertion runs against the real
// compile-time county/city data, which is the same data production uses.

import { CA_COUNTIES, CITIES } from './california-data'
import { isZip, countiesForZip } from './zip'
import {
  PLACE_INDEX,
  TOP_PLACES,
  normalize,
  resolvePlace,
  suggest,
  countyList,
} from './place-match'

let passed = 0
const failures: string[] = []
const notes: string[] = []

function check(name: string, cond: boolean, detail = '') {
  if (cond) passed++
  else failures.push(`${name}${detail ? ` — ${detail}` : ''}`)
}

function countySlugsOf(term: string): string[] | null {
  const r = resolvePlace(term)
  return r && r.kind === 'county' ? r.countySlugs : null
}

function citySlugOf(term: string): string | null {
  const r = resolvePlace(term)
  return r && r.kind === 'city' ? r.citySlug : null
}

// ---------------------------------------------------------------------
// 1. Every county resolves, in every way a person might type it
// ---------------------------------------------------------------------

const COUNTY_NAMES = new Set(CA_COUNTIES.map(c => normalize(c.name)))

for (const c of CA_COUNTIES) {
  const forms = [
    c.name,
    c.name.toLowerCase(),
    c.name.toUpperCase(),
    `${c.name} County`,
    `${c.name} county`,
    `${c.name.toLowerCase()} county`,
    `  ${c.name}  County `,
    `${c.name} Co`,
    `${c.name} County, CA`,
    `${c.name} County California`,
    `County of ${c.name}`,
  ]
  for (const f of forms) {
    const slugs = countySlugsOf(f)
    check(`county "${f}"`, slugs?.includes(c.slug) === true, `got ${JSON.stringify(slugs)}`)
  }
}

// ---------------------------------------------------------------------
// 2. Every city resolves — unless a county of the same name shadows it
// ---------------------------------------------------------------------
// Counties are matched first on purpose: someone typing "Orange" or
// "Santa Clara" almost always means the wider county. Recording which cities
// this affects, rather than asserting either way, so the shadow list is
// visible and reviewable instead of silent.

const shadowed: string[] = []

for (const c of CITIES) {
  const n = normalize(c.name)
  if (COUNTY_NAMES.has(n)) {
    shadowed.push(c.name)
    const slugs = countySlugsOf(c.name)
    check(`shadowed city "${c.name}" -> county`, slugs !== null, 'resolved to nothing at all')
    continue
  }
  check(`city "${c.name}"`, citySlugOf(c.name) === c.slug, `got ${citySlugOf(c.name)}`)
  check(`city "${c.name.toLowerCase()}"`, citySlugOf(c.name.toLowerCase()) === c.slug)
  check(`city "${c.name} CA"`, citySlugOf(`${c.name} CA`) === c.slug)
}

notes.push(`${shadowed.length} city names are shadowed by a same-named county (county wins): ${shadowed.join(', ')}`)

// ---------------------------------------------------------------------
// 3. Cities ending in "City" must survive qualifier stripping
// ---------------------------------------------------------------------

for (const name of ['Culver City', 'Daly City', 'National City', 'Foster City', 'Redwood City', 'Union City', 'Cathedral City']) {
  const city = CITIES.find(c => c.name === name)
  if (!city) { notes.push(`(skipped "${name}" — not in CITIES)`); continue }
  check(`"${name}" not truncated`, citySlugOf(name) === city.slug, `got ${citySlugOf(name)}`)
}

// ---------------------------------------------------------------------
// 4. The reported bug, and its neighbours
// ---------------------------------------------------------------------

const LA = ['la county', 'LA County', 'la  county', 'L.A. County', 'Los Angeles County',
  'los angeles county', 'LOS ANGELES COUNTY', 'la', 'LA', 'L.A.', 'lax', 'City of Los Angeles']
for (const t of LA) {
  check(`LA form "${t}"`, countySlugsOf(t)?.includes('los-angeles') === true, `got ${JSON.stringify(countySlugsOf(t))}`)
}

check('the OC', countySlugsOf('the OC')?.includes('orange') === true)
check('OC', countySlugsOf('OC')?.includes('orange') === true)
check('SD', countySlugsOf('SD')?.includes('san-diego') === true)
check('sac', countySlugsOf('sac')?.includes('sacramento') === true)
check('SLO', countySlugsOf('SLO')?.includes('san-luis-obispo') === true)
check('SF', countySlugsOf('SF')?.includes('san-francisco') === true)

// Multi-county regions
check('Inland Empire', JSON.stringify(countySlugsOf('Inland Empire')) === JSON.stringify(['riverside', 'san-bernardino']))
check('IE', JSON.stringify(countySlugsOf('IE')) === JSON.stringify(['riverside', 'san-bernardino']))
check('SB is ambiguous both ways', (countySlugsOf('SB') ?? []).length === 2)
check('Bay Area spans 9', (countySlugsOf('Bay Area') ?? []).length === 9)
check('East Bay spans 2', (countySlugsOf('East Bay') ?? []).length === 2)
check('Central Valley spans 8', (countySlugsOf('central valley') ?? []).length === 8)

// City-targeted aliases
check('SJ -> san jose city', citySlugOf('SJ') === 'san-jose')

// ---------------------------------------------------------------------
// 5. Company names must NOT be hijacked into place searches
// ---------------------------------------------------------------------

const COMPANY_LIKE = [
  'HERS', 'Acme Energy', 'Title 24 Solutions', 'Golden State Energy Consultants',
  'ABC', 'Energy Docs', 'CalCERTS', 'Rater Pro', 'Green Path', 'EnergySoft',
  'consulting', 'inc', 'llc', 'the energy group', 'test',
]
for (const t of COMPANY_LIKE) {
  check(`company "${t}" stays text`, resolvePlace(t) === null, `resolved to ${JSON.stringify(resolvePlace(t))}`)
}

// ---------------------------------------------------------------------
// 6. Alias keys must not shadow a real place name
// ---------------------------------------------------------------------
// If an alias key were also a genuine county or city name, the alias would win
// and silently redirect a correct search.

const CITY_NAMES = new Set(CITIES.map(c => normalize(c.name)))
for (const entry of PLACE_INDEX) {
  for (const term of entry.terms) {
    const isRealCounty = COUNTY_NAMES.has(term)
    const isRealCity = CITY_NAMES.has(term)
    if (!isRealCounty && !isRealCity) continue
    const r = resolvePlace(term)
    const ok = r !== null && (
      (r.kind === 'county' && CA_COUNTIES.some(c => normalize(c.name) === term && r.countySlugs.includes(c.slug))) ||
      (r.kind === 'city' && CITIES.some(c => normalize(c.name) === term && c.slug === r.citySlug)) ||
      (r.kind === 'county' && isRealCity)
    )
    check(`alias term "${term}" does not shadow a real place`, ok, `resolved to ${JSON.stringify(r)}`)
  }
}

// ---------------------------------------------------------------------
// 7. Round-trip invariant: everything the dropdown can offer must resolve
// ---------------------------------------------------------------------
// The dropdown writes suggestion.query into the search box and submits it. If
// any suggestion's own query failed to resolve, picking it would return zero
// results — the exact failure this whole change exists to remove.

for (const entry of PLACE_INDEX) {
  const r = resolvePlace(entry.query)
  check(`round-trip "${entry.label}" (${entry.query})`, r !== null, 'suggestion query resolves to nothing')
}
for (const entry of TOP_PLACES) {
  check(`top-place round-trip "${entry.label}"`, resolvePlace(entry.query) !== null)
}

// The dropdown must never show the same thing twice — two rows reading
// "Inland Empire" is a bug the round-trip check alone would not catch.
const labelCounts = new Map<string, number>()
for (const e of PLACE_INDEX) labelCounts.set(e.label, (labelCounts.get(e.label) ?? 0) + 1)
const dupes = [...labelCounts.entries()].filter(([, n]) => n > 1)
check('no duplicate labels in the index', dupes.length === 0, dupes.map(([l, n]) => `${l} x${n}`).join(', '))

const ids = PLACE_INDEX.map(e => e.id)
check('no duplicate ids in the index', new Set(ids).size === ids.length)

// An ambiguous abbreviation should offer both candidates as separate, pickable
// rows rather than one combined row that resolves to nothing.
const sbRows = suggest('sb', 8)
check('"sb" offers Santa Barbara', sbRows.some(r => r.label === 'Santa Barbara County'), sbRows.map(r => r.label).join(' / '))
check('"sb" offers San Bernardino', sbRows.some(r => r.label === 'San Bernardino County'), sbRows.map(r => r.label).join(' / '))

// Named regions keep their own row and it must be pickable.
for (const label of ['Inland Empire', 'Bay Area', 'East Bay', 'Central Valley', 'Central Coast']) {
  const row = PLACE_INDEX.find(e => e.label === label)
  check(`region row "${label}" exists`, Boolean(row))
  check(`region row "${label}" is pickable`, row ? resolvePlace(row.query) !== null : false)
}

// ---------------------------------------------------------------------
// 8. Typos produce the right did-you-mean
// ---------------------------------------------------------------------

const TYPOS: Array<[string, string]> = [
  ['los angelas', 'Los Angeles County'],
  ['riverisde', 'Riverside County'],
  ['san bernadino', 'San Bernardino County'],
  ['sacremento', 'Sacramento County'],
  ['irvin', 'Irvine'],
  ['fresna', 'Fresno County'],
  ['oakand', 'Oakland'],
]
for (const [typo, want] of TYPOS) {
  const top = suggest(typo, 3)[0]
  check(`typo "${typo}" suggests ${want}`, top?.label === want, `got ${top?.label ?? 'nothing'}`)
}

// Every typo suggestion must itself resolve, or the retry path is a dead end.
for (const [typo] of TYPOS) {
  const top = suggest(typo, 1)[0]
  check(`typo "${typo}" suggestion is resolvable`, top ? resolvePlace(top.query) !== null : false)
}

// ---------------------------------------------------------------------
// 9. ZIP handling (unchanged behaviour, guarded against regression)
// ---------------------------------------------------------------------

check('91750 -> LA', JSON.stringify(countiesForZip('91750')) === JSON.stringify(['los-angeles']))
check('92618 -> Orange', JSON.stringify(countiesForZip('92618')) === JSON.stringify(['orange']))
check('93701 -> Fresno', JSON.stringify(countiesForZip('93701')) === JSON.stringify(['fresno']))
check('94103 -> SF', JSON.stringify(countiesForZip('94103')) === JSON.stringify(['san-francisco']))
check('12345 is not CA', countiesForZip('12345').length === 0)
check('isZip rejects 4 digits', !isZip('9175'))
check('isZip rejects ZIP+4', !isZip('91750-1234'))
check('ZIPs never resolve as places', resolvePlace('91750') === null)

// ---------------------------------------------------------------------
// 10. Edge cases that must not throw or match wildly
// ---------------------------------------------------------------------

const EDGE = ['', '   ', '!!!', '---', '()', '*', 'a', 'x'.repeat(300), '92618 ', ' la ']
for (const t of EDGE) {
  let threw = false
  try { resolvePlace(t); suggest(t, 5) } catch { threw = true }
  check(`edge input ${JSON.stringify(t.slice(0, 20))} does not throw`, !threw)
}
check('empty string resolves to nothing', resolvePlace('') === null)
check('empty string suggests nothing', suggest('', 5).length === 0)
check('single letter "a" does not fuzzy-match', resolvePlace('a') === null)
check('padded " la " still resolves', countySlugsOf(' la ')?.includes('los-angeles') === true)

// Accents
check('accented input normalises', normalize('Cañada') === 'canada')

// countyList prose
check('countyList 1', countyList(['orange']) === 'Orange County')
check('countyList 2', countyList(['orange', 'los-angeles']) === 'Orange County or Los Angeles County')
check('countyList 3', countyList(['orange', 'los-angeles', 'kern']) === 'Orange County, Los Angeles County, or Kern County')

// ---------------------------------------------------------------------
// 11. Suggestion ranking sanity
// ---------------------------------------------------------------------

check('"los" ranks Los Angeles County first', suggest('los', 5)[0]?.label === 'Los Angeles County')
check('"san" returns several', suggest('san', 8).length >= 5)
check('"orange" ranks the county over the city', suggest('orange', 3)[0]?.kind === 'county')
check('suggest respects the limit', suggest('san', 3).length === 3)
check('TOP_PLACES has 6', TOP_PLACES.length === 6)
check('index covers counties + cities', PLACE_INDEX.length >= CA_COUNTIES.length + CITIES.length - 30)

// ---------------------------------------------------------------------

console.log(`\n${passed} passed, ${failures.length} failed\n`)
if (notes.length) {
  console.log('Notes:')
  for (const n of notes) console.log(`  · ${n}`)
  console.log('')
}
if (failures.length) {
  console.log('FAILURES:')
  for (const f of failures.slice(0, 60)) console.log(`  ✗ ${f}`)
  if (failures.length > 60) console.log(`  … and ${failures.length - 60} more`)
  process.exit(1)
}
console.log('All green.')
