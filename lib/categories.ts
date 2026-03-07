export const CATEGORIES = [
  { value: 'hers', label: 'HERS Rater', color: 'blue', description: 'Home Energy Rating System verification' },
  { value: 'ecc', label: 'ECC Rater', color: 'teal', description: 'Energy Code Compliance verification' },
  { value: 'commissioning', label: 'Commissioning Agent', color: 'purple', description: 'HVAC and mechanical commissioning' },
  { value: 'acceptance_testing', label: 'Acceptance Tester', color: 'orange', description: 'Non-residential acceptance testing' },
] as const

export type CategoryValue = typeof CATEGORIES[number]['value']

export const BADGE_COLORS: Record<string, string> = {
  hers: 'bg-blue-100 text-blue-800',
  ecc: 'bg-teal-100 text-teal-800',
  commissioning: 'bg-purple-100 text-purple-800',
  acceptance_testing: 'bg-orange-100 text-orange-800',
}

export const CATEGORY_LABELS: Record<string, string> = {
  hers: 'HERS Rater',
  ecc: 'ECC Rater',
  commissioning: 'Commissioning Agent',
  acceptance_testing: 'Acceptance Tester',
}
