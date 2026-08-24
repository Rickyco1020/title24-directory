// HERS and ECC are the same role. The 2025 California Energy Code renames the
// Home Energy Rating System program to Energy Code Compliance, but it is the
// same certification, the same field verification, and the same people — so the
// directory lists them as one category.
//
// 'ecc' existed as a separate category value until 2026-08-24. It is kept below
// as a read-only alias so legacy rows, old links (?type=ecc), and any listing
// submitted before the merge still resolve correctly.

export const CATEGORIES = [
  {
    value: 'hers',
    label: 'HERS / ECC Rater',
    color: 'blue',
    icon: '🏠',
    description: 'Field verification under the HERS and ECC programs — the same role, renamed by the 2025 energy code',
  },
  {
    value: 'commissioning',
    label: 'Commissioning Agent',
    color: 'purple',
    icon: '🔧',
    description: 'HVAC and mechanical commissioning',
  },
  {
    value: 'acceptance_testing',
    label: 'Acceptance Tester',
    color: 'orange',
    icon: '✅',
    description: 'Non-residential acceptance testing',
  },
] as const

export type CategoryValue = typeof CATEGORIES[number]['value']

/** Retired category values mapped to the value that replaced them. */
export const CATEGORY_ALIASES: Record<string, string> = {
  ecc: 'hers',
}

export const BADGE_COLORS: Record<string, string> = {
  hers: 'bg-blue-100 text-blue-800',
  ecc: 'bg-blue-100 text-blue-800',
  commissioning: 'bg-purple-100 text-purple-800',
  acceptance_testing: 'bg-orange-100 text-orange-800',
}

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
