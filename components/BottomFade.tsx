'use client'

import { useEffect, useState } from 'react'

/**
 * A soft fade pinned to the bottom of the viewport, purely so the page's
 * own edge — not the browser's — is the last thing a scrolling card meets.
 *
 * Mobile Safari's compact toolbar floats on top of the page rather than
 * reserving space for itself, so whatever card is mid-scroll gets a hard,
 * horizontal guillotine cut through it. We can't move the toolbar, but we
 * can make the edge underneath it read as deliberate: content eases into
 * the page background over the last few rems instead of stopping dead.
 *
 * Hidden once the footer scrolls into view — a light fade painted over the
 * dark footer would look like a bug, not a fix, and by then the page has
 * reached its actual end rather than being cut off mid-list.
 */
export default function BottomFade() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const footer = document.querySelector('footer')
    if (!footer) return

    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting))
    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      aria-hidden
      className={`pointer-events-none fixed inset-x-0 bottom-0 z-[15] h-[calc(4.5rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-paper to-transparent transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    />
  )
}
