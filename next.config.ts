import type { NextConfig } from "next";

// Everything the browser is allowed to fetch, spelled out.
//
// WHY REPORT-ONLY. What this site loads is unusually narrow: next/font
// self-hosts both families at build time, Tailwind ships one stylesheet, there
// are no remote images and no <iframe>s, and Supabase is only ever called from
// the server — no client component touches it — so the browser never opens a
// cross-origin connection except Vercel's analytics beacons. The policy below
// should therefore be a no-op. But "should be" is not "was observed to be", and
// an enforcing policy that is wrong takes the site down rather than logging.
// Report-only logs each violation to the browser console and blocks nothing.
//
// TO ENFORCE IT: load the home page, /directory, a city page, a county page and
// /get-listed with the console open, confirm no CSP report appears, then rename
// the header key below to "Content-Security-Policy". Do it as its own change so
// it can be reverted on its own.
//
// frame-ancestors is deliberately NOT in here — in a report-only header it only
// reports, and clickjacking protection is not an experiment. It stays on the
// enforcing header, exactly as it was.

// Supabase is server-side today. Naming its origin costs nothing and means the
// first client-side query does not arrive as a mystery console error. A
// malformed env var must not take the build down, hence the try.
function supabaseOrigin(): string[] {
  const raw = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!raw) return [];
  try {
    return [new URL(raw).origin];
  } catch {
    return [];
  }
}

// AdSense is off (components/AdUnit.tsx renders nothing without the flag). If
// the flag is ever flipped on, the policy has to widen with it or the ads are
// the thing the CSP breaks.
const adsEnabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";
const adsHosts = adsEnabled
  ? [
      "https://pagead2.googlesyndication.com",
      "https://tpc.googlesyndication.com",
      "https://googleads.g.doubleclick.net",
      "https://adservice.google.com",
    ]
  : [];

const csp = [
  ["default-src", "'self'"],
  // Next.js inlines its own bootstrap script, and every city, county, zone and
  // rater page inlines a JSON-LD block. Both are inline <script> with no nonce
  // wired through, so 'unsafe-inline' is load-bearing until one is. Vercel
  // Analytics and Speed Insights serve from /_vercel/* (same origin) on
  // production deployments and fall back to va.vercel-scripts.com otherwise.
  ["script-src", "'self'", "'unsafe-inline'", "https://va.vercel-scripts.com", ...adsHosts],
  // next/font injects an inline <style> for the font-face declarations, and
  // React writes inline style attributes.
  ["style-src", "'self'", "'unsafe-inline'"],
  // next/font self-hosts Chivo and Martian Mono under /_next/static.
  ["font-src", "'self'"],
  ["img-src", "'self'", "data:", "blob:", ...adsHosts],
  // The beacons both scripts send are same-origin on a Vercel deployment
  // (/_vercel/insights, /_vercel/speed-insights); the two vercel hosts are the
  // fallbacks they use when that proxy is not in front of them.
  ["connect-src", "'self'", "https://va.vercel-scripts.com", "https://vitals.vercel-insights.com", ...supabaseOrigin(), ...adsHosts],
  // Nothing on this site embeds anything.
  ["frame-src", ...(adsEnabled ? adsHosts : ["'none'"])],
  ["object-src", "'none'"],
  // Server actions post back to this origin and nowhere else.
  ["form-action", "'self'"],
  ["base-uri", "'self'"],
]
  .map(directive => directive.join(" "))
  .join("; ");

const securityHeaders = [
  // The MIME type we send is the MIME type we mean.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Nothing on this site needs to be iframed - blocks clickjacking, incl. /admin.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "Content-Security-Policy-Report-Only", value: csp },
  // Full referrer only to same-origin; origin-only cross-site over HTTPS.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nothing here uses the camera, the microphone or location, and nothing
  // opts into FLoC/Topics cohort calculation. Say so, so an injected script
  // or embed can't either.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Two years, subdomains included, and preload-eligible. The platform already
  // sends a bare max-age; without includeSubDomains a future subdomain can be
  // stripped to http, and without `preload` the very first visit is still
  // downgradeable.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // The site is title24directory.com. The *.vercel.app deployment domain
      // serves an indexable duplicate otherwise - send it home permanently.
      {
        source: "/:path*",
        has: [{ type: "host", value: "title24-directory.vercel.app" }],
        destination: "https://www.title24directory.com/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
