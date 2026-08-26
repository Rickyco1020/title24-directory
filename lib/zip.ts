// ZIP -> county resolution for the directory search box.
//
// No rater row stores a ZIP: listings carry counties_served / cities_served as
// slugs. So a query like "91750" has nothing to match and returns zero. These
// map a ZIP to the county (or counties) it sits in, which is what the listings
// are actually keyed on.
//
// Resolution is by the first three digits — the USPS sectional centre. That is
// a postal boundary, not a county one, so a handful of prefixes straddle two
// counties and list both; the caller uses .overlaps() to match either. It is
// always right about the region and right about the county for the large
// majority of California ZIPs. Swapping in a full 5-digit table later only
// needs countiesForZip() to change.

const ZIP_RE = /^\d{5}$/

const ZIP3_TO_COUNTY_SLUGS: Record<string, string[]> = {
  '900': ['los-angeles'], '901': ['los-angeles'], '902': ['los-angeles'],
  '903': ['los-angeles'], '904': ['los-angeles'], '905': ['los-angeles'],
  '906': ['los-angeles'], '907': ['los-angeles'], '908': ['los-angeles'],
  '910': ['los-angeles'], '911': ['los-angeles'], '912': ['los-angeles'],
  '913': ['los-angeles'], '914': ['los-angeles'], '915': ['los-angeles'],
  '916': ['los-angeles'], '917': ['los-angeles'], '918': ['los-angeles'],
  '919': ['san-diego'], '920': ['san-diego'], '921': ['san-diego'],
  '922': ['riverside', 'imperial'],
  '923': ['san-bernardino'], '924': ['san-bernardino'],
  '925': ['riverside', 'san-bernardino'],
  '926': ['orange'], '927': ['orange'], '928': ['orange'],
  '930': ['ventura', 'santa-barbara'],
  '931': ['santa-barbara', 'san-luis-obispo'],
  '932': ['kern'], '933': ['kern'],
  '934': ['ventura'],
  '935': ['kern', 'inyo'],
  '936': ['fresno'], '937': ['fresno'], '938': ['fresno'],
  '939': ['monterey', 'san-benito', 'san-luis-obispo'],
  '940': ['san-mateo'], '941': ['san-francisco'],
  '942': ['sacramento'],
  '943': ['santa-clara'], '944': ['san-mateo'],
  '945': ['alameda', 'contra-costa'], '946': ['alameda'], '947': ['alameda'],
  '948': ['contra-costa'],
  '949': ['marin', 'sonoma'],
  '950': ['santa-clara', 'santa-cruz'], '951': ['santa-clara'],
  '952': ['san-joaquin', 'stanislaus'],
  '953': ['san-joaquin', 'stanislaus', 'merced'],
  '954': ['sonoma', 'napa', 'solano', 'mendocino', 'lake'],
  '955': ['humboldt', 'del-norte', 'trinity'],
  '956': ['sacramento', 'yolo', 'solano'],
  '957': ['sacramento', 'placer', 'el-dorado'],
  '958': ['sacramento', 'placer', 'el-dorado'],
  '959': ['yuba', 'sutter', 'butte', 'nevada'],
  '960': ['shasta', 'tehama', 'siskiyou', 'butte', 'glenn'],
  '961': ['lassen', 'plumas', 'modoc', 'sierra'],
}

export function isZip(term: string): boolean {
  return ZIP_RE.test(term.trim())
}

/** County slugs a ZIP falls in. Empty for a non-ZIP or a non-California ZIP. */
export function countiesForZip(term: string): string[] {
  const t = term.trim()
  if (!ZIP_RE.test(t)) return []
  return ZIP3_TO_COUNTY_SLUGS[t.slice(0, 3)] ?? []
}
