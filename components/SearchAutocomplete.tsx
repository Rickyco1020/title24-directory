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
    // Let React commit the value before the form reads it.
    requestAnimationFrame(() => inputRef.current?.form?.requestSubmit())
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
      <label htmlFor="q" className="block text-sm font-medium text-gray-700 mb-1">
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
        onKeyDown={onKeyDown}
        placeholder="County, city, ZIP, or company name..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
      />

      {open && items.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-80 overflow-y-auto"
        >
          {!value.trim() && (
            <li className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wide text-gray-400">
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
              className={`px-3 py-2 cursor-pointer ${i === active ? 'bg-blue-50' : 'bg-white'}`}
            >
              <span className="block text-sm text-gray-900 truncate">{s.label}</span>
              {s.sublabel && (
                <span className="block text-xs text-gray-500 truncate">{s.sublabel}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
