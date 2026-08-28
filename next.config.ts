import type { NextConfig } from "next";

const securityHeaders = [
  // The MIME type we send is the MIME type we mean.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Nothing on this site needs to be iframed - blocks clickjacking, incl. /admin.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  // Full referrer only to same-origin; origin-only cross-site over HTTPS.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
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
