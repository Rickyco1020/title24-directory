// Place resolution and suggestions for the directory search box.
//
// The box accepts whatever a visitor types. Listings are keyed on slugs
// (counties_served / cities_served), so the job here is turning free text into
// the slug it meant — or, failing that, into a short list of things it might
// have meant, so the empty state can offer a way forward instead of a wall.
//
// Why this exists: slugify('Los Angeles County') is 'los-angeles-county', which
// matches no county slug, no city slug, and no business name. Before this file,
// the most natural query on the site returned nothing. Same for 'la county',
// 'LA', 'SF', 'OC' and every typo.
//
// Everything is compile-time data over 58 counties and ~180 cities. No network
// call, no API key, no per-keystroke billing — the same index serves the
// server-side resolver and the client-side dropdown.

import { CA_COUNTIES, CITIES } from './california-data'

// ---- normalisation ---------------------------------------------------

/** Lowercase, strip accents and punctuation, collapse whitespace. */
export function normalize(term: string): string {
  return term
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

// Trailing words people add that are part of no California place name.
// 'city' is deliberately absent: Culver City, Daly City, National City,
// Foster City, Union City and Yuba City all end in it, and stripping it
// blindly would break them.
const TAIL_WORDS = new Set(['county', 'counties', 'co', 'ca', 'cal', 'calif', 'california', 'area', 'region', 'usa', 'us'])

/** 'the city of los angeles' -> 'los angeles' */
function stripLead(n: string): string {
  return n
    .replace(/^the /, '')
    .replace(/^city of /, '')
    .replace(/^county of /, '')
    .trim()
}

/**
 * Progressively shorter forms to try, longest first. The unstripped form is
 * always tried before anything is removed, so a real place that happens to end
 * in a qualifier word still wins.
 */
function variants(n: string): string[] {
  const out: string[] = []
  const push = (v: string) => { if (v && !out.includes(v)) out.push(v) }

  push(n)
  push(stripLead(n))

  for (const base of [...out]) {
    let words = base.split(' ')
    while (words.length > 1 && TAIL_WORDS.has(words[words.length - 1])) {
      words = words.slice(0, -1)
      push(words.join(' '))
    }
    // '<place> city' only after every unstripped form has had its chance.
    if (words.length > 1 && words[words.length - 1] === 'city') {
      push(words.slice(0, -1).join(' '))
    }
  }
  return out
}

// ---- aliases ---------------------------------------------------------

// Each alias resolves to one or more canonical place phrases, which then go
// through ordinary exact matching. Keeping targets as phrases rather than slugs
// means adding an alias never has to know whether the target is a city or a
// county.
//
// Ambiguous abbreviations map to every candidate on purpose: 'sb' returning
// Santa Barbara and San Bernardino together, clearly labelled, is honest. The
// dropdown lets most visitors disambiguate before they ever submit.
type Alias = { label: string; targets: string[] }

const ALIASES: Record<string, Alias> = {
  // Los Angeles
  'la': { label: 'Los Angeles County', targets: ['los angeles'] },
  'l a': { label: 'Los Angeles County', targets: ['los angeles'] },
  'lax': { label: 'Los Angeles County', targets: ['los angeles'] },
  'lac': { label: 'Los Angeles County', targets: ['los angeles'] },
  'sgv': { label: 'San Gabriel Valley', targets: ['los angeles'] },
  'san gabriel valley': { label: 'San Gabriel Valley', targets: ['los angeles'] },
  'sfv': { label: 'San Fernando Valley', targets: ['los angeles'] },
  'san fernando valley': { label: 'San Fernando Valley', targets: ['los angeles'] },
  'antelope valley': { label: 'Antelope Valley', targets: ['los angeles'] },
  'south bay': { label: 'South Bay', targets: ['los angeles'] },

  // Orange
  'oc': { label: 'Orange County', targets: ['orange'] },
  'the oc': { label: 'Orange County', targets: ['orange'] },

  // San Diego
  'sd': { label: 'San Diego County', targets: ['san diego'] },

  // Inland Empire
  'ie': { label: 'Inland Empire', targets: ['riverside', 'san bernardino'] },
  'inland empire': { label: 'Inland Empire', targets: ['riverside', 'san bernardino'] },
  'riv': { label: 'Riverside County', targets: ['riverside'] },
  'rivco': { label: 'Riverside County', targets: ['riverside'] },
  'coachella valley': { label: 'Coachella Valley', targets: ['riverside'] },
  'sbd': { label: 'San Bernardino County', targets: ['san bernardino'] },
  'san berdoo': { label: 'San Bernardino County', targets: ['san bernardino'] },
  'bernardino': { label: 'San Bernardino County', targets: ['san bernardino'] },
  'high desert': { label: 'High Desert', targets: ['san bernardino'] },
  'sb': { label: 'Santa Barbara or San Bernardino', targets: ['santa barbara', 'san bernardino'] },

  // Bay Area
  'sf': { label: 'San Francisco', targets: ['san francisco'] },
  'sfo': { label: 'San Francisco', targets: ['san francisco'] },
  'san fran': { label: 'San Francisco', targets: ['san francisco'] },
  'frisco': { label: 'San Francisco', targets: ['san francisco'] },
  'bay area': {
    label: 'Bay Area',
    targets: ['alameda', 'contra costa', 'marin', 'napa', 'san francisco', 'san mateo', 'santa clara', 'solano', 'sonoma'],
  },
  'east bay': { label: 'East Bay', targets: ['alameda', 'contra costa'] },
  'north bay': { label: 'North Bay', targets: ['marin', 'napa', 'sonoma', 'solano'] },
  'peninsula': { label: 'The Peninsula', targets: ['san mateo'] },
  'silicon valley': { label: 'Silicon Valley', targets: ['santa clara'] },
  'south bay area': { label: 'South Bay (Santa Clara)', targets: ['santa clara'] },
  'sj': { label: 'San Jose', targets: ['san jose'] },
  'san jo': { label: 'San Jose', targets: ['san jose'] },

  // Sacramento / Central
  'sac': { label: 'Sacramento County', targets: ['sacramento'] },
  'sacto': { label: 'Sacramento County', targets: ['sacramento'] },
  'central valley': {
    label: 'Central Valley',
    targets: ['fresno', 'kern', 'kings', 'madera', 'merced', 'san joaquin', 'stanislaus', 'tulare'],
  },
  'central coast': {
    label: 'Central Coast',
    targets: ['monterey', 'san luis obispo', 'santa barbara', 'santa cruz'],
  },
  'slo': { label: 'San Luis Obispo County', targets: ['san luis obispo'] },
}

// ---- lookup tables ---------------------------------------------------

const COUNTY_BY_NORM = new Map(CA_COUNTIES.map(c => [normalize(c.name), c]))
const CITY_BY_NORM = new Map(CITIES.map(c => [normalize(c.name), c]))
const COUNTY_NAME_BY_SLUG = new Map(CA_COUNTIES.map(c => [c.slug, c.name]))

export function countyLabel(slug: string): string {
  const name = COUNTY_NAME_BY_SLUG.get(slug)
  return name ? `${name} County` : slug
}

/** Join county slugs into readable prose: 'A County, B County, or C County'. */
export function countyList(slugs: string[]): string {
  const names = slugs.map(countyLabel)
  if (names.length <= 1) return names[0] ?? ''
  if (names.length === 2) return `${names[0]} or ${names[1]}`
  return `${names.slice(0, -1).join(', ')}, or ${names[names.length - 1]}`
}

// ---- suggestions -----------------------------------------------------

export type Suggestion = {
  id: string
  /** What the visitor reads. */
  label: string
  /** The smaller line under it. */
  sublabel: string
  kind: 'county' | 'city' | 'region'
  /** Canonical text placed in the search box when this is chosen. */
  query: string
  /** Normalised strings this entry can be matched against. */
  terms: string[]
}

function buildIndex(): Suggestion[] {
  const out: Suggestion[] = []

  for (const c of CA_COUNTIES) {
    const n = normalize(c.name)
    out.push({
      id: `county:${c.slug}`,
      label: `${c.name} County`,
      // No sublabel: the label already ends in "County", and repeating it just
      // to fill the second line is noise.
      sublabel: '',
      kind: 'county',
      query: `${c.name} County`,
      terms: [n, `${n} county`],
    })
  }

  for (const c of CITIES) {
    out.push({
      id: `city:${c.slug}`,
      label: c.name,
      sublabel: `City · ${c.county} County`,
      kind: 'city',
      query: c.name,
      terms: [normalize(c.name)],
    })
  }

  const byId = new Map(out.map(e => [e.id, e]))
  const addTerm = (entry: Suggestion, term: string) => {
    if (term && !entry.terms.includes(term)) entry.terms.push(term)
  }
  const entryForPhrase = (phrase: string): Suggestion | undefined => {
    const county = COUNTY_BY_NORM.get(phrase)
    if (county) return byId.get(`county:${county.slug}`)
    const city = CITY_BY_NORM.get(phrase)
    if (city) return byId.get(`city:${city.slug}`)
    return undefined
  }

  for (const [key, alias] of Object.entries(ALIASES)) {
    // A named region only earns its own row if its label is itself something the
    // resolver understands. Otherwise picking that row from the dropdown would
    // put unresolvable text in the box and return nothing — the exact failure
    // this file exists to remove.
    const labelNorm = normalize(alias.label)
    const labelResolves = labelNorm in ALIASES || Boolean(entryForPhrase(labelNorm))

    if (alias.targets.length > 1 && labelResolves) {
      const id = `region:${labelNorm}`
      const existing = byId.get(id)
      if (existing) {
        addTerm(existing, key)
        continue
      }
      const row: Suggestion = {
        id,
        label: alias.label,
        sublabel: alias.targets
          .map(t => COUNTY_BY_NORM.get(t)?.name)
          .filter(Boolean)
          .join(', '),
        kind: 'region',
        query: alias.label,
        terms: [key, labelNorm],
      }
      out.push(row)
      byId.set(id, row)
      continue
    }

    // Everything else folds into the real place(s) it points at, so typing 'oc'
    // surfaces the genuine Orange County row rather than a second, competing
    // one — and an ambiguous abbreviation like 'sb' surfaces both candidates as
    // separate rows for the visitor to choose between.
    for (const target of alias.targets) {
      const entry = entryForPhrase(target)
      if (entry) addTerm(entry, key)
    }
  }

  return out
}

export const PLACE_INDEX: Suggestion[] = buildIndex()

/** Shown on focus before anything is typed, so the empty box teaches the format. */
export const TOP_PLACES: Suggestion[] = [
  'county:los-angeles',
  'county:orange',
  'county:san-diego',
  'county:riverside',
  'county:san-bernardino',
  'county:santa-clara',
]
  .map(id => PLACE_INDEX.find(e => e.id === id))
  .filter((e): e is Suggestion => Boolean(e))

function editDistance(a: string, b: string): number {
  if (a === b) return 0
  const m = a.length
  const n = b.length
  if (!m) return n
  if (!n) return m
  let prev = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    const cur = [i]
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    prev = cur
  }
  return prev[n]
}

/**
 * Every query token must prefix some token the entry knows about.
 *
 * Whole-string matching alone cannot handle a half-typed multi-word query:
 * 'la coun' is not a prefix, substring or near-miss of 'los angeles county',
 * and 'la' only appears as a separate alias term. Matching token-by-token is
 * what makes the dropdown useful while someone is still typing.
 */
function tokenScore(qTokens: string[], entry: Suggestion): number {
  if (qTokens.length < 2) return 0
  let total = 0
  for (const qt of qTokens) {
    let best = 0
    for (const t of entry.terms) {
      for (const et of t.split(' ')) {
        if (et === qt) best = Math.max(best, 100)
        else if (et.startsWith(qt)) best = Math.max(best, 90 - Math.min(30, et.length - qt.length))
      }
    }
    // One unmatched token disqualifies the entry, so 'la coun' cannot drag in
    // every place whose name merely contains 'la'.
    if (best === 0) return 0
    total += best
  }
  // Ranks above a bare substring hit, below a clean whole-string prefix.
  return 500 + total / qTokens.length
}

/** Higher is better. 0 means no match at all. */
function score(term: string, entry: Suggestion, qTokens: string[]): number {
  let best = tokenScore(qTokens, entry)
  for (const t of entry.terms) {
    let s = 0
    if (t === term) s = 1000
    else if (t.startsWith(term)) s = 800 - (t.length - term.length)
    else if (t.split(' ').some(w => w.startsWith(term))) s = 600 - (t.length - term.length)
    else if (t.includes(term)) s = 400 - (t.length - term.length)
    else if (term.length >= 4) {
      // Typo tolerance scaled to length: 'irvin' and 'los angelas' should land,
      // 'irving construction' should not be dragged onto Irvine.
      const allowed = term.length >= 8 ? 2 : 1
      const d = editDistance(term, t)
      if (d <= allowed) s = 300 - d * 50
    }
    if (s > best) best = s
  }
  // Counties are the coarser, more commonly wanted filter — break ties toward them.
  if (best > 0 && entry.kind === 'county') best += 5
  return best
}

/** Ranked suggestions for free text. Empty input yields nothing. */
export function suggest(term: string, limit = 8): Suggestion[] {
  const n = normalize(term)
  if (!n) return []
  // 'the' carries no signal and would disqualify every entry under the
  // all-tokens-must-match rule; the whole-string path still catches 'the OC'.
  const qTokens = n.split(' ').filter(t => t && t !== 'the')
  const scored: Array<{ e: Suggestion; s: number }> = []
  for (const e of PLACE_INDEX) {
    const s = score(n, e, qTokens)
    if (s > 0) scored.push({ e, s })
  }
  scored.sort((a, b) => b.s - a.s || a.e.label.localeCompare(b.e.label))
  return scored.slice(0, limit).map(x => x.e)
}

// ---- resolution ------------------------------------------------------

export type PlaceResolution =
  | { kind: 'county'; countySlugs: string[]; label: string }
  | { kind: 'city'; citySlug: string; countySlug: string; label: string }

/** Exact resolution of a single canonical phrase. No fuzz, no aliases. */
function resolvePhrase(phrase: string): PlaceResolution | null {
  const county = COUNTY_BY_NORM.get(phrase)
  if (county) return { kind: 'county', countySlugs: [county.slug], label: `${county.name} County` }
  const city = CITY_BY_NORM.get(phrase)
  if (city) return { kind: 'city', citySlug: city.slug, countySlug: city.county_slug, label: city.name }
  return null
}

/**
 * Turn free text into a place filter, or null if it isn't one.
 *
 * Order matters and mirrors what the directory already did: counties before
 * cities (so 'Orange' and 'Santa Clara', which are both, mean the county), and
 * exact before fuzzy. Deliberately does NOT guess fuzzily — a company name that
 * happens to sit near a city name must stay a company-name search. Callers fall
 * back to suggest() only after a text search has actually come back empty.
 */
export function resolvePlace(term: string): PlaceResolution | null {
  const n = normalize(term)
  if (!n) return null

  for (const v of variants(n)) {
    const alias = ALIASES[v]
    if (alias) {
      const resolutions = alias.targets
        .map(resolvePhrase)
        .filter((r): r is PlaceResolution => r !== null)
      const countySlugs = resolutions.flatMap(r => (r.kind === 'county' ? r.countySlugs : []))
      if (countySlugs.length) {
        return { kind: 'county', countySlugs, label: alias.label }
      }
      const city = resolutions.find(r => r.kind === 'city')
      if (city) return city
    }

    const direct = resolvePhrase(v)
    if (direct) return direct
  }

  return null
}
