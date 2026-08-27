// The site's own base URL, in one place.
//
// This used to be hardcoded to https://title24directory.com in twelve files.
// That domain does not resolve, so every canonical tag was telling Google the
// real page lived on a host that does not exist, every sitemap URL was dead,
// and the breadcrumb JSON-LD pointed nowhere.
//
// Set NEXT_PUBLIC_SITE_URL in Vercel the moment the custom domain's DNS is
// pointed, and everything below follows. Until then the fallback is the URL
// that actually serves the site.
//
// Note: this is only for URLs. The @title24directory.com email addresses are a
// separate, verified Resend sending domain and must not be changed here — mail
// delivery depends on MX/SPF records, not on the website's A record.

const RAW =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : '') ||
  'https://title24-directory.vercel.app'

export const SITE_URL = RAW.replace(/\/+$/, '')

/** Absolute URL for a site-relative path. */
export function absoluteUrl(path = '/'): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
