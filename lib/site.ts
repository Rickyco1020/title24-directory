// The site's own base URL, in one place.
//
// This used to be hardcoded to https://title24directory.com in twelve files.
// Whenever that host and the served host disagree, every page ships a
// <link rel="canonical"> naming a URL other than the one being served, which is
// an instruction to Google to index the other one instead.
//
// The domain does now resolve; the remaining mismatch is www. Verified live:
// the apex returns a redirect to https://www.title24directory.com/, which
// answers 200. So the default below is www, and NEXT_PUBLIC_SITE_URL moves the
// whole site to a different domain the moment its DNS is pointed.
//
// Note: this is only for URLs. The @title24directory.com email addresses are a
// separate, verified Resend sending domain and must not be changed here — mail
// delivery depends on MX/SPF records, not on the website's A record.

const RAW =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : '') ||
  // title24directory.com resolves and serves, but the apex redirects to www —
  // so canonicalising to the apex would point every page through a redirect.
  // Name the host that actually answers with a 200.
  'https://www.title24directory.com'

function clean(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, '')
  // `new URL(SITE_URL)` in app/layout.tsx runs at module scope, so a bare host
  // in the env var ('title24directory.com') would throw and take down every
  // route on the site. Assume https rather than crash.
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
}

export const SITE_URL = clean(RAW)

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = '/'): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
