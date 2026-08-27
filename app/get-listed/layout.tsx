import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Get Listed Free',
  description: 'Submit your business to California\'s Title 24 rater directory. Free listings for HERS raters, ECC raters, commissioning agents, and acceptance testers.',
  alternates: { canonical: absoluteUrl('/get-listed') },
}

export default function GetListedLayout({ children }: { children: React.ReactNode }) {
  return children
}
