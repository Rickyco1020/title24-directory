// County → CEC building climate zone.
//
// ─────────────────────────────────────────────────────────────────────────
// THIS TABLE IS DELIBERATELY EMPTY. DO NOT POPULATE IT FROM MEMORY.
//
// The hero map can redline the zone a county sits in (see ZoneSheet), which
// is a genuinely useful thing to show a GC and a page worth ranking for.
// But a climate zone is a compliance fact: printing zone 12 on a county that
// is actually split between 11 and 12 is worse than printing nothing, and
// this site's whole value is being the one directory that isn't guessing.
//
// Fill it from the CEC's own reference — the ZIP-code-to-climate-zone list
// that ships with CBECC, or the "California Building Climate Zones" table on
// energy.ca.gov — the same source the map geometry in
// components/CaliforniaClimateZones.tsx came from.
//
// Format: county slug (as produced by slugify) → every zone the county
// touches, low to high. Multi-zone counties are normal and render fine;
// all listed zones get redlined together.
//
//   export const COUNTY_ZONES: Record<string, readonly string[]> = {
//     'sacramento': ['12'],
//     'los-angeles': ['6', '8', '9', '14', '16'],
//   }
//
// Until a county appears here, its page renders the plain base sheet with no
// zone claim attached. That degradation is intentional.
// ─────────────────────────────────────────────────────────────────────────

export const COUNTY_ZONES: Record<string, readonly string[]> = {}

/** Zones for a county slug, or an empty array when we don't know. */
export function zonesForCounty(countySlug: string): readonly string[] {
  return COUNTY_ZONES[countySlug] ?? []
}

/**
 * Human-readable zone phrase for a county, or null when unknown.
 * Returns "climate zone 12" / "climate zones 6, 8 and 9".
 */
export function zoneLabel(countySlug: string): string | null {
  const zones = zonesForCounty(countySlug)
  if (!zones.length) return null
  if (zones.length === 1) return `climate zone ${zones[0]}`
  const head = zones.slice(0, -1).join(', ')
  return `climate zones ${head} and ${zones[zones.length - 1]}`
}

/** Short form for the map callout: "Zone 12" / "Zones 6 · 8 · 9". */
export function zoneCallout(countySlug: string): string | null {
  const zones = zonesForCounty(countySlug)
  if (!zones.length) return null
  return zones.length === 1 ? `Zone ${zones[0]}` : `Zones ${zones.join(' · ')}`
}
