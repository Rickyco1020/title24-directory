// One call site for every conversion event on the site, so which analytics
// backend receives them stays a configuration question rather than something
// threaded through components.
//
// Two sinks, both optional at runtime:
//   - window.dataLayer — read by GA4's gtag or by Google Tag Manager if either
//     is ever added to the page. Pushing to an array that does not exist yet
//     is safe: the tag reads whatever is already queued when it loads, so
//     events fired before the tag arrives are not lost.
//   - Vercel Analytics' track(), which is already on every page via the
//     <Analytics /> component in the root layout. Custom events are a Pro
//     feature; on Hobby the call is simply ignored.
//
// Nothing here throws. An analytics call that breaks a phone link is a worse
// outcome than a missing row in a report.

import { track } from '@vercel/analytics'

type EventProps = Record<string, string | number | boolean | null>

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[]
  }
}

export function trackEvent(name: string, props: EventProps = {}): void {
  if (typeof window === 'undefined') return

  try {
    window.dataLayer = window.dataLayer ?? []
    window.dataLayer.push({ event: name, ...props })
  } catch {
    // A blocked, frozen or overwritten dataLayer is not worth a broken page.
  }

  try {
    track(name, props)
  } catch {
    // Same reasoning.
  }
}
