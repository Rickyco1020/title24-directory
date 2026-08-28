'use client'

// Type-ahead for the directory search box.
//
// Suggestions come from the compile-time county/city index in lib/place-match,
// so this costs nothing to run and never proposes a place the directory has no
// concept of. A hosted autocomplete (Google Places and friends) bills per
// keystroke and would happily suggest Denver.

import { useEffect, useMemo, useRef, useState } from 'react'
import { suggest, TOP_PLACES, type Suggestion } from '@/lib/place-match'

export default function SearchAutocomplete({ defaultValue = '' }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // An empty box offers the counties most people are here for, which teaches
  // the format without the visitor having to guess it.
  const items = useMemo(
    () => (value.trim() ? suggest(value, 8) : TOP_PLACES),
    [value],
  )

  useEffect(() => {
    function onDocDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocDown)
    return () => document.removeEventListener('mousedown', onDocDown)
  }, [])

  function choose(s: Suggestion) {
    setValue(s.query)
    setOpen(false)
    // Let React commit the value before the form reads it. A timer rather than
    // requestAnimationFrame: rAF is paused in a background tab, which would
    // leave a chosen suggestion sitting there never submitting.
    setTimeout(() => inputRef.current?.form?.requestSubmit(), 0)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false)
      return
    }
    if (!open || !items.length) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(a => (a + 1) % items.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(a => (a - 1 + items.length) % items.length)
    } else if (e.key === 'Enter') {
      // Only intercept when the visitor is actually riding the list. Typing a
      // company name and hitting Enter must still submit what they typed.
      if (active > 0 || value.trim() === '') return
      const hit = items[active]
      if (hit && hit.query.toLowerCase() !== value.trim().toLowerCase()) {
        e.preventDefault()
        choose(hit)
      }
    }
  }

  const listId = 'q-suggestions'

  return (
    <div ref={wrapRef} className="relative">
      <label htmlFor="q" className="t-label mb-1.5 block">
        Search
      </label>
      <input
        ref={inputRef}
        id="q"
        name="q"
        type="text"
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && items[active] ? `sug-${items[active].id}` : undefined}
        value={value}
        onChange={e => {
          setValue(e.target.value)
          setOpen(true)
          // Reset the highlight here rather than in an effect keyed on `value`:
          // typing is the only thing that reorders the list, and doing it in an
          // effect costs a second render pass for every keystroke.
          setActive(0)
        }}
        onFocus={() => setOpen(true)}
        // Options are chosen on mousedown with preventDefault, so the input
        // never blurs on a click — this only fires when focus genuinely leaves,
        // which is what closes the list for someone tabbing past the field.
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        placeholder="County, city, ZIP, or company name"
        className="w-full rounded border border-rule bg-surface px-3 py-2 text-sm text-ink transition-colors placeholder:text-muted focus:border-ink focus:outline-none"
      />

      {open && items.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 z-[30] mt-1 max-h-80 overflow-y-auto overflow-hidden rounded border border-ink bg-surface shadow-[0_10px_28px_oklch(0_0_0/0.10)]"
        >
          {!value.trim() && (
            <li className="t-label border-b border-rule-soft px-3 pb-1.5 pt-2.5">
              Most searched
            </li>
          )}
          {items.map((s, i) => (
            <li
              key={s.id}
              id={`sug-${s.id}`}
              role="option"
              aria-selected={i === active}
              // mousedown, not click: the input must not blur before we read it.
              onMouseDown={e => {
                e.preventDefault()
                choose(s)
              }}
              onMouseEnter={() => setActive(i)}
              className={`cursor-pointer px-3 py-2 ${i === active ? 'bg-accent-wash' : 'bg-surface'}`}
            >
              <span className={`block truncate text-sm ${i === active ? 'text-accent' : 'text-ink'}`}>{s.label}</span>
              {s.sublabel && (
                <span className="block truncate text-xs text-muted">{s.sublabel}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
