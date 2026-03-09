'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-blue-700 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col space-y-3">
            <Link
              href="/directory"
              onClick={() => setIsOpen(false)}
              className={`text-lg font-medium px-3 py-2 rounded-lg transition-colors ${pathname === '/directory' ? 'text-blue-700 bg-blue-50' : 'text-gray-600 hover:text-blue-700 hover:bg-gray-50'}`}
            >
              Find a Rater
            </Link>
            <Link
              href="/resources"
              onClick={() => setIsOpen(false)}
              className={`text-lg font-medium px-3 py-2 rounded-lg transition-colors ${pathname === '/resources' ? 'text-blue-700 bg-blue-50' : 'text-gray-600 hover:text-blue-700 hover:bg-gray-50'}`}
            >
              Resources
            </Link>
            <Link
              href="/get-listed"
              onClick={() => setIsOpen(false)}
              className="bg-blue-700 text-white text-lg font-medium px-3 py-2 rounded-lg hover:bg-blue-800 transition-colors text-center"
            >
              Get Listed
            </Link>
          </nav>
        </div>
      )}
    </div>
  )
}
