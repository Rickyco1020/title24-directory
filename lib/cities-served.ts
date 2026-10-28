/**
 * Free-text "cities served" -> stored city slugs. Shared by the public Get
 * Listed action and the admin edit action so both store the same shape.
 */
import { resolvePlace } from '@/lib/place-match'
import { slugify } from '@/lib/california-data'

// The cities box is free text but the search matches cities_served against
// slugs ('irvine'). Without normalising here, a rater who types "Irvine" or
// "Irvine, CA" is invisible to city search while one who types "irvine" is
// found — so everything gets resolved to a slug on the way in.
//
// Unrecognised entries are kept, slugified, rather than dropped: plenty of
// small California cities are legitimate even when they are not in our list,
// and silently discarding a rater's service area would be worse than storing
// it in a consistent shape. County names are skipped — counties have their own
// checkboxes and would otherwise land in the wrong column.

// What is left over when someone writes 'Irvine, CA' and the list is split on
// commas. On its own it names no place; without this check the state name was
// stored as a city slug — a live test submission produced ["irvine","ca",...].
const STATE_TAILS = new Set(['ca', 'cal', 'calif', 'california', 'usa', 'us', 'united states'])

export function parseCitiesServed(raw?: string): string[] {
  if (!raw) return []
  const out: string[] = []
  // Commas, semicolons and newlines are all things people separate lists with.
  for (const part of raw.split(/[,;\n]/)) {
    const trimmed = part.trim()
    if (!trimmed || STATE_TAILS.has(trimmed.toLowerCase())) continue
    const resolved = resolvePlace(trimmed)
    if (resolved?.kind === 'county') continue
    const slug = resolved?.kind === 'city' ? resolved.citySlug : slugify(trimmed)
    if (slug && !out.includes(slug)) out.push(slug)
  }
  return out.slice(0, 60)
}
