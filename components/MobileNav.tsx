'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/directory', label: 'Find a Rater' },
  { href: '/resources', label: 'Resources' },
]

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Route change closes the panel. Without this, tapping a link navigates
  // underneath a menu that stays open over the new page.
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false)
        buttonRef.current?.focus()
      }
    }
    function onDown(e: MouseEvent) {
      const t = e.target as Node
      if (!panelRef.current?.contains(t) && !buttonRef.current?.contains(t)) setIsOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [isOpen])

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(o => !o)}
        className="flex h-9 w-9 items-center justify-center rounded text-ink transition-colors hover:bg-sunk"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
      >
        <span aria-hidden="true" className="relative block h-3.5 w-5">
          <span
            className={`absolute left-0 block h-0.5 w-5 bg-current transition-transform duration-200 ${
              isOpen ? 'top-1.5 rotate-45' : 'top-0'
            }`}
          />
          <span
            className={`absolute left-0 top-1.5 block h-0.5 w-5 bg-current transition-opacity duration-200 ${
              isOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`absolute left-0 block h-0.5 w-5 bg-current transition-transform duration-200 ${
              isOpen ? 'top-1.5 -rotate-45' : 'top-3'
            }`}
          />
        </span>
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          id="mobile-menu"
          className="absolute left-0 right-0 top-16 z-[30] border-b border-ink bg-surface shadow-[0_12px_28px_oklch(0_0_0/0.08)]"
        >
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-4">
            {LINKS.map(link => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded px-3 py-2.5 text-base font-medium transition-colors ${
                    active ? 'bg-accent-wash text-accent' : 'text-body hover:bg-sunk hover:text-ink'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
            <Link href="/get-listed" className="btn-accent mt-1 px-3 py-2.5 text-center text-base">
              Get Listed
            </Link>
          </nav>
        </div>
      )}
    </div>
  )
}
