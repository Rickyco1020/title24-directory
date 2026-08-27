import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Link from 'next/link'
import MobileNav from '@/components/MobileNav'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { SITE_URL } from '@/lib/site'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | Title 24 Directory',
    default: 'Title 24 Directory | Find HERS & ECC Raters in California',
  },
  description: 'Find certified HERS raters, ECC raters, commissioning agents, and acceptance testers across California. The most complete Title 24 compliance directory.',
  metadataBase: new URL(SITE_URL),
  verification: {
    google: '-KyQtMRifeytgspRHN_ukGNKioN5_oQ9cdnxaUMrn2U',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-blue-700 font-bold text-xl">Title24</span>
                <span className="text-gray-700 font-semibold text-xl">Directory</span>
              </Link>
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/directory" className="text-gray-600 hover:text-blue-700 font-medium transition-colors">Find a Rater</Link>
                <Link href="/resources" className="text-gray-600 hover:text-blue-700 font-medium transition-colors">Resources</Link>
                <Link href="/get-listed" className="bg-blue-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-800 transition-colors">Get Listed</Link>
              </nav>
              <MobileNav />
            </div>
          </div>
        </header>
        <main>{children}</main>
        <footer className="bg-gray-900 text-gray-300 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-white font-bold text-lg mb-4">Title24 Directory</h3>
                <p className="text-sm text-gray-400">California's most complete directory of HERS raters, ECC raters, commissioning agents, and acceptance testers.</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Directory</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/directory?type=hers" className="hover:text-white transition-colors">HERS / ECC Raters</Link></li>
                  <li><Link href="/directory?type=commissioning" className="hover:text-white transition-colors">Commissioning Agents</Link></li>
                  <li><Link href="/directory?type=acceptance_testing" className="hover:text-white transition-colors">Acceptance Testers</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">Resources</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/resources/what-is-a-hers-rater" className="hover:text-white transition-colors">What is a HERS Rater?</Link></li>
                  <li><Link href="/resources/cf2r-vs-cf3r" className="hover:text-white transition-colors">CF2R vs CF3R</Link></li>
                  <li><Link href="/resources/title-24-compliance-guide" className="hover:text-white transition-colors">Title 24 Compliance Guide</Link></li>
                  <li><Link href="/resources" className="hover:text-white transition-colors">All Resources</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-3">For Raters</h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/get-listed" className="hover:text-white transition-colors">Get Listed Free</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-gray-500">
              <p>© {new Date().getFullYear()} Title24 Directory. All rights reserved.</p>
            </div>
          </div>
        </footer>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
