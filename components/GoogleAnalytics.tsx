// GA4 via gtag.js, loaded only when a measurement ID is configured.
//
// The ID comes from NEXT_PUBLIC_GA_MEASUREMENT_ID rather than being hardcoded,
// so pointing the site at a different property — or turning analytics off
// entirely — is a Vercel environment-variable change and a redeploy, not a
// code change. With no ID set, this renders nothing at all: no script, no
// network request, no cookie. That is the correct behaviour for preview
// deployments and local development, which should never pollute production
// numbers.
//
// Deliberately NOT next/script's beforeInteractive: analytics must never sit
// on the critical path of a directory page. afterInteractive loads it once
// the page is usable.

import Script from 'next/script'

export default function GoogleAnalytics({ gaId }: { gaId?: string }) {
  if (!gaId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  )
}
