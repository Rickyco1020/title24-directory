/**
 * When each resource guide was first published and last edited.
 *
 * The guides live as a literal in `app/resources/[slug]/page.tsx` with no dates
 * of their own, so the sitemap used to stamp all of them with the build time —
 * a lastmod that changed on every deploy whether or not a word had. These dates
 * were read out of the git history of that file, per article body, on
 * 2026-11-19, and are the only source `app/sitemap.ts` uses for /resources.
 *
 * Editing a guide? Bump its `updated` here in the same commit. Adding one? Add
 * its slug here, or it will not be in the sitemap at all — the sitemap lists
 * exactly the slugs in this map.
 */
export const RESOURCE_DATES: Record<string, { published: string; updated: string }> = {
  'what-is-a-hers-rater': { published: '2026-03-07', updated: '2026-08-29' },
  'cf2r-vs-cf3r': { published: '2026-03-07', updated: '2026-08-29' },
  'title-24-compliance-guide': { published: '2026-03-07', updated: '2026-08-29' },
  'what-is-acceptance-testing': { published: '2026-03-07', updated: '2026-08-29' },
  'hers-vs-ecc-rater': { published: '2026-03-07', updated: '2026-08-29' },
  'title-24-solar-requirements': { published: '2026-03-07', updated: '2026-08-29' },
  'what-is-a-cf1r': { published: '2026-03-07', updated: '2026-08-29' },
  'duct-leakage-testing': { published: '2026-03-07', updated: '2026-08-29' },
  'heat-pump-water-heater-title-24': { published: '2026-03-07', updated: '2026-08-29' },
  'performance-path-title-24': { published: '2026-03-08', updated: '2026-08-29' },
  'adu-title-24-requirements': { published: '2026-10-05', updated: '2026-10-05' },
  'hers-test-cost': { published: '2026-10-05', updated: '2026-10-05' },
  '2025-energy-code-changes': { published: '2026-10-05', updated: '2026-10-05' },
  'hvac-replacement-hers-rater': { published: '2026-03-07', updated: '2026-08-29' },
  'refrigerant-charge-verification': { published: '2026-10-05', updated: '2026-10-05' },
  'quality-insulation-installation-qii': { published: '2026-10-05', updated: '2026-10-05' },
  'how-to-find-cf3r-registry': { published: '2026-10-05', updated: '2026-10-05' },
  'hvac-changeout-permit-california': { published: '2026-10-05', updated: '2026-10-05' },
}
