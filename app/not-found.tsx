import Link from 'next/link'
import type { Metadata } from 'next'

// Without this the tab inherits the layout's default title, so a dead URL
// looks — in history, in bookmarks, in a shared tab — exactly like the
// homepage. Name it for what it is.
export const metadata: Metadata = {
  title: 'Page not found',
}

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-start px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <p className="t-label">Error 404</p>

      <p className="mt-3 text-[clamp(3.5rem,12vw,7rem)] font-bold leading-none tracking-[-0.035em] text-ink">
        404
      </p>

      <h1 className="mt-5 max-w-[24ch] text-[clamp(1.4rem,3.2vw,2rem)] font-bold leading-[1.1]">
        This page doesn&rsquo;t exist — but the <span className="marked">raters</span> do.
      </h1>

      <div className="mt-9 flex flex-wrap items-center gap-3">
        <Link href="/directory" className="btn-accent px-5 py-2.5 text-sm">
          Browse the directory
        </Link>
        <Link href="/" className="btn-quiet px-5 py-2.5 text-sm">
          Back home
        </Link>
      </div>
    </div>
  )
}
