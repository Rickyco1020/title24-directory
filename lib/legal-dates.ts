/**
 * Last-revised dates of the two legal pages, in one place. The pages print
 * them and app/sitemap.ts uses them as lastmod, so the two cannot disagree.
 * Each page keeps its own date: revising one must not restamp the other.
 */
export const LEGAL_UPDATED = {
  privacy: '2026-09-01',
  terms: '2026-09-01',
} as const

/** '2026-09-01' -> 'September 1, 2026'. Pinned to UTC so the day never slips. */
export function formatLegalDate(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })
}
