// HERS and ECC are the same role. The 2025 California Energy Code renames the
// Home Energy Rating System program to Energy Code Compliance, but it is the
// same certification, the same field verification, and the same people — so the
// directory lists them as one category.
//
// 'ecc' existed as a separate category value until 2026-08-24. It is kept below
// as a read-only alias so legacy rows, old links (?type=ecc), and any listing
// submitted before the merge still resolve correctly.

// `code` is the short form used in title-block cells and dense tables, where
// the full label would wrap. It is not an abbreviation we invented — these are
// what the certificates themselves are called.
export const CATEGORIES = [
  {
    value: 'hers',
    label: 'HERS / ECC Rater',
    code: 'CF3R',
    description: 'Field verification under the HERS and ECC programs, the same role renamed by the 2025 energy code',
  },
  {
    value: 'commissioning',
    label: 'Commissioning Agent',
    code: 'NRCX',
    description: 'HVAC and mechanical commissioning for non-residential buildings',
  },
  {
    value: 'acceptance_testing',
    label: 'Acceptance Tester',
    code: 'NRCA',
    description: 'Non-residential acceptance testing of mechanical, lighting and envelope systems',
  },
] as const

export type CategoryValue = typeof CATEGORIES[number]['value']

/** Retired category values mapped to the value that replaced them. */
export const CATEGORY_ALIASES: Record<string, string> = {
  ecc: 'hers',
}

// Services are no longer colour-coded. Three arbitrary hues (blue, purple,
// orange) told a visitor nothing the label didn't already say, and they were
// the loudest thing on a results page. One tag treatment, the label carries
// the meaning, and colour stays reserved for action and active state.

export const CATEGORY_LABELS: Record<string, string> = {
  hers: 'HERS / ECC Rater',
  ecc: 'HERS / ECC Rater',
  commissioning: 'Commissioning Agent',
  acceptance_testing: 'Acceptance Tester',
}

/** Resolve a stored or query-string value to its current category value. */
export function canonicalCategory(value: string): string {
  return CATEGORY_ALIASES[value] ?? value
}

/**
 * The services a listing should display: aliases collapsed, order preserved,
 * duplicates dropped. Without this a row carrying both 'hers' and 'ecc' would
 * render the same badge twice.
 */
export function displayServices(services: readonly string[] | null | undefined): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const service of services ?? []) {
    const value = canonicalCategory(service)
    if (seen.has(value)) continue
    seen.add(value)
    out.push(value)
  }
  return out
}

/**
 * Every stored value that should match a category filter — the canonical value
 * plus any retired alias. Filtering on 'hers' must still find rows that were
 * only ever tagged 'ecc', whether or not the data migration has run.
 */
export function categoryMatchValues(value: string): string[] {
  const canonical = canonicalCategory(value)
  const aliases = Object.keys(CATEGORY_ALIASES).filter(k => CATEGORY_ALIASES[k] === canonical)
  return [canonical, ...aliases]
}
