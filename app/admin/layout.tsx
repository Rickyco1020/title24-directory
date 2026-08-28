import type { Metadata } from 'next'

// The login page is a client component and can't export metadata itself.
// This layout puts noindex on everything under /admin.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
