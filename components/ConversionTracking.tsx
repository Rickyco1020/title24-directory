'use client'

// The directory has two value moments: a rater getting listed, and a visitor
// leaving for a rater — a phone number, an email address, a website. Every
// one of those links is server-rendered, inside RaterCard or on the rater
// detail page, so attaching an onClick to each would mean converting both to
// client components and keeping the two in step forever.
//
// One delegated listener on the document catches all of them instead,
// including the ones on pages that do not exist yet.

import { useEffect } from 'react'
import { trackEvent } from '@/lib/analytics'

/**
 * Which outbound action a link represents, or null for ordinary navigation.
 * Read from the href rather than a data attribute so nothing has to be added
 * to the markup that renders listings.
 */
function outboundEvent(href: string): string | null {
  if (href.startsWith('tel:')) return 'rater_phone_click'
  if (href.startsWith('mailto:')) return 'rater_email_click'
  if (/^https?:\/\//i.test(href)) {
    try {
      return new URL(href).hostname === window.location.hostname
        ? null
        : 'rater_website_click'
    } catch {
      return null
    }
  }
  return null
}

export default function ConversionTracking() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = event.target
      if (!(target instanceof Element)) return

      const anchor = target.closest('a[href]')
      if (!anchor) return

      const name = outboundEvent(anchor.getAttribute('href') ?? '')
      if (!name) return

      trackEvent(name, { path: window.location.pathname })
    }

    // Capture phase: a tel: or external click takes the page away with it, and
    // a listener waiting for the bubble can lose that race on mobile.
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}
