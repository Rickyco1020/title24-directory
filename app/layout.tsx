import type { Metadata } from 'next'
import { Chivo, Martian_Mono } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import MobileNav from '@/components/MobileNav'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { SITE_URL } from '@/lib/site'

// Chivo carries everything: headings, body, buttons, data. A tight,
// mechanical grotesque — the weight jump from 400 to 700 does the work a
// second display family would otherwise be hired for.
const chivo = Chivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-chivo',
  display: 'swap',
})

// Mono is confined to title-block labels and certification numbers, where a
// drawing would set them the same way. It never touches body copy.
const martian = Martian_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-martian',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | Title 24 Directory',
    default: 'Title 24 Directory | Find HERS & ECC Raters in California',
  },
  description:
    'Find certified HERS raters, ECC raters, commissioning agents, and acceptance testers near you — searchable by California city, county, or CEC climate zone.',
  metadataBase: new URL(SITE_URL),
  verification: {
    google: '-KyQtMRifeytgspRHN_ukGNKioN5_oQ9cdnxaUMrn2U',
  },
}

const FOOTER_COLUMNS = [
  {
    heading: 'Directory',
    links: [
      { href: '/directory?type=hers', label: 'HERS / ECC Raters' },
      { href: '/directory?type=commissioning', label: 'Commissioning Agents' },
      { href: '/directory?type=acceptance_testing', label: 'Acceptance Testers' },
      { href: '/directory', label: 'Browse all' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { href: '/resources/what-is-a-hers-rater', label: 'What is a HERS Rater?' },
      { href: '/resources/cf2r-vs-cf3r', label: 'CF2R vs CF3R' },
      { href: '/resources/title-24-compliance-guide', label: 'Compliance guide' },
      { href: '/resources', label: 'All resources' },
    ],
  },
  {
    heading: 'For raters',
    links: [
      { href: '/get-listed', label: 'Get listed free' },
      { href: '/contact', label: 'Contact us' },
    ],
  },
]

const LEGAL_LINKS = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${chivo.variable} ${martian.variable}`}>
      <body className="font-sans antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[50] focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-surface"
        >
          Skip to content
        </a>

        <header className="sticky top-0 z-[20] border-b border-ink bg-surface">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link href="/" className="text-[1.05rem] font-bold tracking-[-0.025em] text-ink">
                Title<span className="text-accent">24</span> Directory
              </Link>

              <nav className="hidden items-center gap-7 md:flex">
                <Link
                  href="/directory"
                  className="text-sm font-medium text-body transition-colors hover:text-ink"
                >
                  Find a Rater
                </Link>
                <Link
                  href="/resources"
                  className="text-sm font-medium text-body transition-colors hover:text-ink"
                >
                  Resources
                </Link>
                <Link href="/get-listed" className="btn-accent px-3.5 py-2 text-sm">
                  Get Listed
                </Link>
              </nav>

              <MobileNav />
            </div>
          </div>
        </header>

        <main id="main">{children}</main>

        {/* Hairline in paper, not ink: a page ending in a dark band (the
            homepage CTA) would otherwise merge into the footer with no seam,
            and on a light page the ink background is its own edge. */}
        <footer className="border-t border-paper/15 bg-ink text-paper/80">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="grid gap-10 md:grid-cols-4">
              <div>
                <p className="text-[1.05rem] font-bold tracking-[-0.025em] text-paper">
                  Title<span className="text-accent-rule">24</span> Directory
                </p>
                <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-paper/65">
                  Certified HERS and ECC raters, commissioning agents, and acceptance testers
                  across California. Free to search, no account.
                </p>
              </div>

              {FOOTER_COLUMNS.map(col => (
                <div key={col.heading}>
                  <p className="t-label text-paper/60">{col.heading}</p>
                  <ul className="mt-3 space-y-2 text-sm">
                    {col.links.map(link => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-paper/75 transition-colors hover:text-paper"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Privacy and terms live on the bottom rule rather than in a
                fourth column: they belong on every page (an ad network will not
                review a site whose policy is only reachable from one of them),
                but they are not navigation and should not read as a peer of
                "Find a rater". */}
            <div className="mt-12 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-paper/15 pt-6">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <p className="text-xs text-paper/65">
                  © {new Date().getFullYear()} Title24 Directory
                </p>
                {LEGAL_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-xs text-paper/65 underline-offset-4 transition-colors hover:text-paper hover:underline"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <p className="t-label text-paper/55">
                Zone geometry: CEC building climate zones, 2015 boundaries
              </p>
            </div>
          </div>
        </footer>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
