// County and city → CEC building climate zone.
//
// GENERATED, NOT HAND-WRITTEN. A climate zone is a compliance fact, so every
// value below traces to the California Energy Commission's own published
// mapping rather than anyone's recollection:
//
//   zone      BuildingClimateZonesByZIPCode_ada.xlsx (CEC, 2,694 ZIPs)
//   ZIP→place "California ZIP codes" feature layer, CA state geoportal
//
// Joined on 5-digit ZIP. Since the 2013 Standards the CEC defines zone
// boundaries along ZIP boundaries, so a ZIP sits in exactly one zone; a city
// or county spanning several ZIPs can therefore legitimately span several
// zones, and the arrays below reflect that rather than flattening it.
//
// Verified against known ground truth before shipping: Sacramento 12,
// San Francisco 3, Fresno 13, Truckee 16, El Centro 15, Palm Springs 15,
// Redding 11, Bakersfield 13, San Diego 7. All matched.
//
// The ZIP→place layer has no rows for the far north or eastern Sierra, so the
// 21 cities in Del Norte, Humboldt, Inyo, Lassen, Modoc, Mono and Siskiyou were
// resolved a second way: a point query against the CEC's own zone service at
// each town's coordinates, which is the same authority answering the same
// question about a point instead of a ZIP. Coordinates were validated by
// confirming each falls inside the right county on the state's published county
// boundaries. Humboldt and Del Norte towns return zone 1; the Siskiyou, Inyo,
// Mono, Lassen and Modoc towns return 16.
//
// COUNTY COVERAGE IS STILL 51 OF 58, ON PURPOSE. Those seven counties have
// city-level zones but no COUNTY_ZONES entry, because the point method samples
// incorporated towns rather than the whole county, and a county can touch zones
// none of its towns sit in. Claiming Humboldt is "zone 1" on the strength of
// seven coastal towns would be an overclaim, so those county pages render the
// plain base sheet and say nothing. Silence beats a wrong number on a
// compliance directory. All 472 city pages now resolve.

import { CITIES, cityName, countyName } from './california-data'

export const CITY_ZONES: Record<string, readonly string[]> = {
  'adelanto': ['14'],
  'agoura-hills': ['9'],
  'alameda': ['3'],
  'albany': ['3'],
  'alhambra': ['9'],
  'aliso-viejo': ['6'],
  'alturas': ['16'],
  'american-canyon': ['2'],
  'anaheim': ['8'],
  'anderson': ['11'],
  'angels-camp': ['12'],
  'antioch': ['12'],
  'apple-valley': ['14'],
  'arcadia': ['9'],
  'arcata': ['1'],
  'arroyo-grande': ['5'],
  'artesia': ['8'],
  'arvin': ['13'],
  'atascadero': ['4'],
  'atherton': ['3'],
  'atwater': ['12'],
  'auburn': ['11'],
  'avenal': ['13'],
  'azusa': ['9'],
  'bakersfield': ['13'],
  'baldwin-park': ['9'],
  'banning': ['15'],
  'barstow': ['14'],
  'beaumont': ['10'],
  'bell-gardens': ['8'],
  'bellflower': ['8'],
  'belmont': ['3'],
  'benicia': ['12'],
  'berkeley': ['3'],
  'beverly-hills': ['9'],
  'big-bear-lake': ['16'],
  'biggs': ['11'],
  'bishop': ['16'],
  'blue-lake': ['1'],
  'blythe': ['15'],
  'brawley': ['15'],
  'brea': ['8'],
  'brentwood': ['12'],
  'brisbane': ['3'],
  'buellton': ['5'],
  'buena-park': ['8'],
  'burbank': ['9'],
  'burlingame': ['3'],
  'calabasas': ['9'],
  'calexico': ['15'],
  'california-city': ['14'],
  'calimesa': ['10'],
  'calipatria': ['15'],
  'calistoga': ['2'],
  'camarillo': ['6'],
  'campbell': ['4'],
  'capitola': ['3'],
  'carlsbad': ['7'],
  'carpinteria': ['6'],
  'carson': ['6', '8'],
  'cathedral-city': ['15'],
  'ceres': ['12'],
  'cerritos': ['8'],
  'chico': ['11'],
  'chino': ['10'],
  'chino-hills': ['10'],
  'chowchilla': ['13'],
  'chula-vista': ['7', '10'],
  'citrus-heights': ['12'],
  'claremont': ['9'],
  'clayton': ['12'],
  'clearlake': ['2'],
  'cloverdale': ['2'],
  'clovis': ['13'],
  'coachella': ['15'],
  'coalinga': ['13'],
  'colfax': ['11'],
  'colton': ['10'],
  'colusa': ['11'],
  'compton': ['8'],
  'concord': ['12'],
  'corcoran': ['13'],
  'corning': ['11'],
  'corona': ['10'],
  'coronado': ['7'],
  'corte-madera': ['3'],
  'costa-mesa': ['6'],
  'cotati': ['2'],
  'covina': ['9'],
  'crescent-city': ['1'],
  'culver-city': ['8'],
  'cupertino': ['4'],
  'cypress': ['8'],
  'daly-city': ['3'],
  'dana-point': ['6'],
  'danville': ['12'],
  'davis': ['12'],
  'del-mar': ['7'],
  'delano': ['13'],
  'desert-hot-springs': ['15'],
  'diamond-bar': ['9'],
  'dinuba': ['13'],
  'dixon': ['12'],
  'dorris': ['16'],
  'dos-palos': ['12'],
  'downey': ['8'],
  'duarte': ['9'],
  'dublin': ['12'],
  'dunsmuir': ['16'],
  'el-cajon': ['10'],
  'el-centro': ['15'],
  'el-cerrito': ['3'],
  'el-dorado-hills': ['12'],
  'el-monte': ['9'],
  'el-segundo': ['6'],
  'elk-grove': ['12'],
  'emeryville': ['3'],
  'encinitas': ['7'],
  'escalon': ['12'],
  'escondido': ['10'],
  'etna': ['16'],
  'eureka': ['1'],
  'exeter': ['13'],
  'fairfax': ['2'],
  'fairfield': ['12'],
  'farmersville': ['13'],
  'ferndale': ['1'],
  'fillmore': ['9'],
  'firebaugh': ['13'],
  'folsom': ['12'],
  'fontana': ['10'],
  'fort-jones': ['16'],
  'fortuna': ['1'],
  'fountain-valley': ['6'],
  'fowler': ['13'],
  'fremont': ['3'],
  'fresno': ['13'],
  'fullerton': ['8'],
  'garden-grove': ['6', '8'],
  'gardena': ['8'],
  'gilroy': ['4'],
  'glendale': ['9'],
  'glendora': ['9'],
  'goleta': ['6'],
  'gonzales': ['3'],
  'grand-terrace': ['10'],
  'grass-valley': ['11'],
  'greenfield': ['4'],
  'gridley': ['11'],
  'grover-beach': ['5'],
  'gustine': ['12'],
  'half-moon-bay': ['3'],
  'hanford': ['13'],
  'hawaiian-gardens': ['8'],
  'hawthorne': ['8'],
  'hayward': ['3'],
  'healdsburg': ['2'],
  'hemet': ['10'],
  'hercules': ['3'],
  'hermosa-beach': ['6'],
  'hesperia': ['14'],
  'highland': ['10'],
  'hollister': ['4'],
  'holtville': ['15'],
  'hughson': ['12'],
  'huntington-beach': ['6'],
  'huntington-park': ['8'],
  'huron': ['13'],
  'imperial': ['15'],
  'imperial-beach': ['7'],
  'indian-wells': ['15'],
  'indio': ['15'],
  'inglewood': ['8'],
  'ione': ['12'],
  'irvine': ['6', '8'],
  'jackson': ['12'],
  'kerman': ['13'],
  'king-city': ['4'],
  'kingsburg': ['13'],
  'la-canada-flintridge': ['9'],
  'la-habra': ['8'],
  'la-mesa': ['7'],
  'la-mirada': ['9'],
  'la-puente': ['9'],
  'la-quinta': ['15'],
  'la-verne': ['9'],
  'lafayette': ['12'],
  'laguna-beach': ['6'],
  'laguna-hills': ['6'],
  'laguna-niguel': ['6'],
  'lake-elsinore': ['10'],
  'lake-forest': ['8'],
  'lakeport': ['2'],
  'lakewood': ['8'],
  'lancaster': ['14'],
  'larkspur': ['2'],
  'lawndale': ['8'],
  'lemon-grove': ['7'],
  'lemoore': ['13'],
  'lincoln': ['11'],
  'lindsay': ['13'],
  'live-oak': ['11'],
  'livermore': ['12'],
  'livingston': ['12'],
  'lodi': ['12'],
  'loma-linda': ['10'],
  'lomita': ['6'],
  'lompoc': ['5'],
  'long-beach': ['6', '8'],
  'loomis': ['11'],
  'los-alamitos': ['8'],
  'los-altos': ['4'],
  'los-angeles': ['6', '8', '9'],
  'los-banos': ['12'],
  'los-gatos': ['4'],
  'loyalton': ['16'],
  'lynwood': ['8'],
  'madera': ['13'],
  'malibu': ['6'],
  'mammoth-lakes': ['16'],
  'manhattan-beach': ['6'],
  'manteca': ['12'],
  'maricopa': ['13'],
  'marina': ['3'],
  'martinez': ['12'],
  'marysville': ['11'],
  'maywood': ['8'],
  'mcfarland': ['13'],
  'mendota': ['13'],
  'menifee': ['10'],
  'menlo-park': ['3'],
  'merced': ['12'],
  'mill-valley': ['3'],
  'millbrae': ['3'],
  'milpitas': ['4'],
  'mission-viejo': ['8'],
  'modesto': ['12'],
  'monrovia': ['9'],
  'montague': ['16'],
  'montclair': ['10'],
  'montebello': ['9'],
  'monterey': ['3'],
  'monterey-park': ['9'],
  'moorpark': ['9'],
  'moraga': ['12'],
  'moreno-valley': ['10'],
  'morgan-hill': ['4'],
  'morro-bay': ['5'],
  'mount-shasta': ['16'],
  'mountain-view': ['4'],
  'murrieta': ['10'],
  'napa': ['2'],
  'national-city': ['7'],
  'nevada-city': ['11'],
  'newark': ['3'],
  'newman': ['12'],
  'newport-beach': ['6'],
  'norco': ['10'],
  'norwalk': ['8'],
  'novato': ['2'],
  'oakdale': ['12'],
  'oakland': ['3'],
  'oakley': ['12'],
  'oceanside': ['7'],
  'ojai': ['9'],
  'ontario': ['10'],
  'orange': ['8'],
  'orange-cove': ['13'],
  'orinda': ['12'],
  'orland': ['11'],
  'oroville': ['11'],
  'oxnard': ['6'],
  'pacific-grove': ['3'],
  'pacifica': ['3'],
  'palm-desert': ['15'],
  'palm-springs': ['15'],
  'palmdale': ['14'],
  'palo-alto': ['4'],
  'paradise': ['11'],
  'paramount': ['8'],
  'parlier': ['13'],
  'pasadena': ['9'],
  'paso-robles': ['4'],
  'patterson': ['12'],
  'perris': ['10'],
  'petaluma': ['2'],
  'pico-rivera': ['9'],
  'pinole': ['3'],
  'pismo-beach': ['5'],
  'pittsburg': ['12'],
  'placentia': ['8'],
  'placerville': ['12'],
  'pleasant-hill': ['12'],
  'pleasanton': ['12'],
  'plymouth': ['12'],
  'pomona': ['9'],
  'port-hueneme': ['6'],
  'porterville': ['13'],
  'portola': ['16'],
  'portola-valley': ['3'],
  'poway': ['10'],
  'rancho-cordova': ['12'],
  'rancho-cucamonga': ['10'],
  'rancho-mirage': ['15'],
  'rancho-palos-verdes': ['6'],
  'rancho-santa-margarita': ['8'],
  'red-bluff': ['11'],
  'redding': ['11'],
  'redlands': ['10'],
  'redondo-beach': ['6'],
  'redwood-city': ['3'],
  'reedley': ['13'],
  'rialto': ['10'],
  'richmond': ['3'],
  'ridgecrest': ['14'],
  'rio-dell': ['1'],
  'rio-vista': ['12'],
  'ripon': ['12'],
  'riverbank': ['12'],
  'riverside': ['10'],
  'rocklin': ['11'],
  'rohnert-park': ['2'],
  'rosemead': ['9'],
  'roseville': ['11'],
  'sacramento': ['12'],
  'salinas': ['3'],
  'san-anselmo': ['2'],
  'san-bernardino': ['10', '16'],
  'san-bruno': ['3'],
  'san-carlos': ['3'],
  'san-clemente': ['6'],
  'san-diego': ['7', '10'],
  'san-dimas': ['9'],
  'san-fernando': ['9'],
  'san-francisco': ['3'],
  'san-gabriel': ['9'],
  'san-jacinto': ['10'],
  'san-joaquin': ['13'],
  'san-jose': ['4'],
  'san-juan-bautista': ['4'],
  'san-juan-capistrano': ['6'],
  'san-leandro': ['3'],
  'san-luis-obispo': ['5'],
  'san-marcos': ['10'],
  'san-mateo': ['3'],
  'san-pablo': ['3'],
  'san-rafael': ['2'],
  'san-ramon': ['12'],
  'sanger': ['13'],
  'santa-ana': ['8'],
  'santa-barbara': ['6'],
  'santa-clara': ['4'],
  'santa-clarita': ['9', '16'],
  'santa-cruz': ['3'],
  'santa-fe-springs': ['9'],
  'santa-maria': ['5'],
  'santa-monica': ['6'],
  'santa-paula': ['9'],
  'santa-rosa': ['2'],
  'santee': ['10'],
  'saratoga': ['4'],
  'sausalito': ['3'],
  'scotts-valley': ['3'],
  'seal-beach': ['6'],
  'seaside': ['3'],
  'sebastopol': ['2'],
  'selma': ['13'],
  'shafter': ['13'],
  'shasta-lake': ['11'],
  'sierra-madre': ['9'],
  'simi-valley': ['9'],
  'solana-beach': ['7'],
  'soledad': ['3'],
  'solvang': ['5'],
  'sonoma': ['2'],
  'sonora': ['12'],
  'south-gate': ['8'],
  'south-lake-tahoe': ['16'],
  'south-pasadena': ['9'],
  'south-san-francisco': ['3'],
  'stanton': ['8'],
  'stockton': ['12'],
  'suisun-city': ['12'],
  'sunnyvale': ['4'],
  'susanville': ['16'],
  'sutter-creek': ['12'],
  'taft': ['13'],
  'tehachapi': ['16'],
  'temecula': ['10'],
  'temple-city': ['9'],
  'thousand-oaks': ['9'],
  'torrance': ['6', '8'],
  'tracy': ['12'],
  'trinidad': ['1'],
  'truckee': ['16'],
  'tulare': ['13'],
  'tulelake': ['16'],
  'turlock': ['12'],
  'tustin': ['8'],
  'twentynine-palms': ['14'],
  'ukiah': ['2'],
  'union-city': ['3'],
  'upland': ['10'],
  'vacaville': ['12'],
  'vallejo': ['3', '12'],
  'ventura': ['6'],
  'victorville': ['14'],
  'villa-park': ['8'],
  'visalia': ['13'],
  'vista': ['7'],
  'walnut': ['9'],
  'walnut-creek': ['12'],
  'wasco': ['13'],
  'waterford': ['12'],
  'watsonville': ['3'],
  'weed': ['16'],
  'west-covina': ['9'],
  'west-hollywood': ['9'],
  'west-sacramento': ['12'],
  'westlake-village': ['9'],
  'westminster': ['6'],
  'westmorland': ['15'],
  'wheatland': ['11'],
  'whittier': ['9'],
  'wildomar': ['10'],
  'williams': ['11'],
  'willits': ['2'],
  'willows': ['11'],
  'windsor': ['2'],
  'winters': ['12'],
  'woodlake': ['13'],
  'woodland': ['12'],
  'yorba-linda': ['8'],
  'yountville': ['2'],
  'yreka': ['16'],
  'yuba-city': ['11'],
  'yucaipa': ['10'],
  'yucca-valley': ['14'],
}

export const COUNTY_ZONES: Record<string, readonly string[]> = {
  'alameda': ['3', '12'],
  'alpine': ['16'],
  'amador': ['12', '16'],
  'butte': ['11', '16'],
  'calaveras': ['12', '16'],
  'colusa': ['11'],
  'contra-costa': ['3', '12'],
  'el-dorado': ['12', '16'],
  'fresno': ['13', '16'],
  'glenn': ['11'],
  'imperial': ['15'],
  'kern': ['13', '14', '16'],
  'kings': ['13'],
  'lake': ['2'],
  'los-angeles': ['6', '8', '9', '14', '16'],
  'madera': ['13', '16'],
  'marin': ['2', '3'],
  'mariposa': ['12', '16'],
  'mendocino': ['2'],
  'merced': ['12'],
  'monterey': ['3', '4'],
  'napa': ['2'],
  'nevada': ['11', '16'],
  'orange': ['6', '8'],
  'placer': ['11', '16'],
  'plumas': ['16'],
  'riverside': ['10', '15', '16'],
  'sacramento': ['12'],
  'san-benito': ['4'],
  'san-bernardino': ['10', '14', '15', '16'],
  'san-diego': ['7', '10', '14', '15'],
  'san-francisco': ['3'],
  'san-joaquin': ['12'],
  'san-luis-obispo': ['4', '5'],
  'san-mateo': ['3', '4'],
  'santa-barbara': ['4', '5', '6'],
  'santa-clara': ['4'],
  'santa-cruz': ['3', '4'],
  'shasta': ['11'],
  'sierra': ['16'],
  'solano': ['3', '12'],
  'sonoma': ['1', '2'],
  'stanislaus': ['12'],
  'sutter': ['11'],
  'tehama': ['11', '16'],
  'trinity': ['16'],
  'tulare': ['13', '16'],
  'tuolumne': ['12', '16'],
  'ventura': ['6', '9'],
  'yolo': ['11', '12'],
  'yuba': ['11', '16'],
}

/** Zones for a county slug. Empty when we have no sourced value. */
export function zonesForCounty(countySlug: string): readonly string[] {
  return COUNTY_ZONES[countySlug] ?? []
}

/**
 * Zones for a city slug, falling back to the county's when the city itself
 * isn't in the ZIP→place layer. The county fallback is a wider claim, never a
 * wrong one: a city is always inside its county's zone set.
 */
export function zonesForCity(citySlug: string, countySlug?: string): readonly string[] {
  const own = CITY_ZONES[citySlug]
  if (own?.length) return own
  return countySlug ? zonesForCounty(countySlug) : []
}

/** "climate zone 12" / "climate zones 6, 8 and 9", or null when unknown. */
export function zoneLabel(zones: readonly string[]): string | null {
  if (!zones.length) return null
  if (zones.length === 1) return `climate zone ${zones[0]}`
  return `climate zones ${zones.slice(0, -1).join(', ')} and ${zones[zones.length - 1]}`
}

/** Title-block value: "12" / "6 · 8 · 9". Null when unknown. */
export function zoneCallout(zones: readonly string[]): string | null {
  return zones.length ? zones.join(' · ') : null
}

// ---- zone → counties (the inverse map) --------------------------------
// The homepage map is clicked from the other direction: a visitor points at
// where they are and wants the counties inside that zone. Built by inverting
// the two tables above rather than typed out a second time, so it can never
// disagree with the county and city pages.


export type ZoneCounties = {
  /** Counties whose own CEC county-level zone set includes this zone. */
  readonly full: readonly string[]
  /**
   * Counties with no county-level entry at all — the seven the ZIP→place
   * source doesn't cover — that have at least one town in this zone. Listed
   * separately and labelled as such: "this county has towns in zone 1" is a
   * sourced claim, "this county is zone 1" would not be.
   */
  readonly partial: readonly string[]
}

const ZONE_TO_COUNTIES: ReadonlyMap<string, ZoneCounties> = (() => {
  const full = new Map<string, Set<string>>()
  const partial = new Map<string, Set<string>>()
  const bucket = (m: Map<string, Set<string>>, zone: string) => {
    let s = m.get(zone)
    if (!s) m.set(zone, (s = new Set()))
    return s
  }

  for (const [county, zones] of Object.entries(COUNTY_ZONES)) {
    for (const zone of zones) bucket(full, zone).add(county)
  }

  for (const city of CITIES) {
    if (COUNTY_ZONES[city.county_slug]) continue
    for (const zone of CITY_ZONES[city.slug] ?? []) bucket(partial, zone).add(city.county_slug)
  }

  const byName = (a: string, b: string) => countyName(a).localeCompare(countyName(b))
  const out = new Map<string, ZoneCounties>()
  for (const zone of new Set([...full.keys(), ...partial.keys()])) {
    out.set(zone, {
      full: [...(full.get(zone) ?? [])].sort(byName),
      partial: [...(partial.get(zone) ?? [])].sort(byName),
    })
  }
  return out
})()

/** Counties inside a CEC zone. Both lists empty for a zone number we don't know. */
export function countiesForZone(zone: string): ZoneCounties {
  return ZONE_TO_COUNTIES.get(zone) ?? { full: [], partial: [] }
}

const ZONE_TO_CITIES: ReadonlyMap<string, readonly string[]> = (() => {
  const out = new Map<string, string[]>()
  for (const [city, zones] of Object.entries(CITY_ZONES)) {
    for (const zone of zones) {
      let list = out.get(zone)
      if (!list) out.set(zone, (list = []))
      list.push(city)
    }
  }
  const byName = (a: string, b: string) => cityName(a).localeCompare(cityName(b))
  for (const list of out.values()) list.sort(byName)
  return out
})()

/**
 * Cities the CEC's own ZIP mapping places in this zone. A city with no entry of
 * its own is left out rather than inherited from its county — a county can span
 * several zones, so the inherited answer would be a guess.
 */
export function citiesForZone(zone: string): readonly string[] {
  return ZONE_TO_CITIES.get(zone) ?? []
}
