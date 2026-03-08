'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const close = () => setOpen(false)

  const links = [
    { href: '/directory', label: 'Find a Rater' },
    { href: '/resources', label: 'Resources' },
  ]

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 text-gray-600 hover:text-blue-700 transition-colors"
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50 px-4 py-4">
          <nav className="flex flex-col gap-1">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={close}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-700'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/get-listed"
              onClick={close}
              className="mt-2 bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors text-center"
            >
              Get Listed Free →
            </Link>
          </nav>
        </div>
      )}
    </div>
  )
}
