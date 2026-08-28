'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CZ_NUMBERS, CZ_VIEWBOX, CZ_ZONES } from '@/components/CaliforniaClimateZones'

export type ZoneCounty = {
  slug: string
  name: string
  /** Approved listings covering this county, or null if the count query failed. */
  raters: number | null
}

export type ZonePanel = {
  zone: string
  counties: ZoneCounty[]
  partial: ZoneCounty[]
}

/**
 * The homepage's "browse by climate zone" control: the CEC zone map, clickable,
 * with the counties inside the picked zone listed beside it.
 *
 * Two things worth knowing about how this is built.
 *
 * **Every panel is in the HTML, not just the open one.** The hidden ones are
 * `hidden`, not unmounted, so all 58 county links ship in the server-rendered
 * markup. The grid this replaced carried twelve. Client-only links would have
 * been an SEO regression dressed up as an upgrade.
 *
 * **The map is `aria-hidden` and the chips are the real control.** A screen
 * reader gets sixteen plainly-named buttons instead of sixteen unlabelled
 * shapes; the chips are also what makes this usable on a phone, where zone 7 is
 * about the size of a fingertip. Hover and focus run in both directions, so
 * pointing at a chip lights the region and vice versa.
 */
export default function ZoneMapPicker({
  panels,
  topCounties,
}: {
  panels: ZonePanel[]
  /** Busiest counties, shown before a zone is picked. */
  topCounties: ZoneCounty[]
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  const shown = hovered ?? selected

  return (
    <div className="mt-8 grid gap-x-10 gap-y-8 lg:grid-cols-12">
      {/* ── The map ── */}
      <figure className="lg:col-span-5">
        <svg
          viewBox={CZ_VIEWBOX}
          className="mx-auto block h-[19rem] w-auto max-w-full sm:h-[24rem] lg:h-[30rem]"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          focusable="false"
        >
          {CZ_ZONES.map(zone => {
            const isSelected = zone.z === selected
            const isLit = zone.z === shown
            return (
              <path
                key={zone.z}
                d={zone.d}
                onClick={() => setSelected(zone.z)}
                onMouseEnter={() => setHovered(zone.z)}
                onMouseLeave={() => setHovered(current => (current === zone.z ? null : current))}
                className={`cursor-pointer transition-[fill-opacity,stroke-opacity] duration-150 ${
                  isLit ? 'text-accent' : 'text-ink'
                }`}
                fill="currentColor"
                fillOpacity={isSelected ? 0.5 : isLit ? 0.3 : zone.o}
                stroke="currentColor"
                strokeOpacity={isLit ? 0.95 : 0.28}
                strokeWidth={isLit ? 2 : 1}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            )
          })}
        </svg>

        <figcaption className="t-label mt-3 text-center">
          {shown ? `Climate zone ${shown}` : 'CEC building climate zones 1–16'}
        </figcaption>
      </figure>

      {/* ── The panel ── */}
      <div className="lg:col-span-7">
        <div
          className="grid max-w-[30rem] grid-cols-4 gap-1.5 sm:grid-cols-8"
          role="group"
          aria-label="California climate zones"
        >
          {CZ_NUMBERS.map(zone => {
            const isSelected = zone === selected
            return (
              <button
                key={zone}
                type="button"
                onClick={() => setSelected(zone)}
                onMouseEnter={() => setHovered(zone)}
                onMouseLeave={() => setHovered(current => (current === zone ? null : current))}
                onFocus={() => setHovered(zone)}
                onBlur={() => setHovered(current => (current === zone ? null : current))}
                aria-pressed={isSelected}
                className={`rounded border px-2.5 py-2 font-mono text-xs font-semibold transition-colors ${
                  isSelected
                    ? 'border-accent bg-accent text-white'
                    : 'border-rule bg-surface text-ink hover:border-accent hover:text-accent'
                }`}
              >
                {zone}
                <span className="sr-only"> — climate zone {zone}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-6 min-h-[15rem]" aria-live="polite">
          {!selected && (
            <>
              <p className="max-w-[46ch] text-[0.95rem] leading-relaxed">
                Every California address sits in one of sixteen CEC building climate zones, and the
                zone drives what your Title 24 report has to show. Click where your project is — or
                pick a number — to see the counties in that zone and who covers them.
              </p>

              {topCounties.length > 0 && (
                <div className="mt-6">
                  <p className="t-label">Most covered right now</p>
                  <ul className="mt-2 border-t border-rule">
                    {topCounties.map(county => (
                      <li key={county.slug} className="border-b border-rule">
                        <Link
                          href={`/directory/county/${county.slug}`}
                          className="group flex items-baseline justify-between gap-4 py-2.5 text-sm font-medium text-ink transition-colors hover:text-accent"
                        >
                          <span>{county.name} County</span>
                          <span className="t-label shrink-0 transition-colors group-hover:text-accent">
                            {county.raters} {county.raters === 1 ? 'rater' : 'raters'} →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}

          {panels.map(panel => (
            <div key={panel.zone} hidden={panel.zone !== selected}>
              <h3 className="text-lg font-bold text-ink">
                Climate zone {panel.zone}
                <span className="t-label ml-3 font-normal">
                  {panel.counties.length + panel.partial.length}{' '}
                  {panel.counties.length + panel.partial.length === 1 ? 'county' : 'counties'}
                </span>
              </h3>

              {panel.counties.length > 0 && (
                <ul className="mt-3 border-t border-rule">
                  {panel.counties.map(county => (
                    <li key={county.slug} className="border-b border-rule">
                      <Link
                        href={`/directory/county/${county.slug}`}
                        className="group flex items-baseline justify-between gap-4 py-2.5 text-sm font-medium text-ink transition-colors hover:text-accent"
                      >
                        <span>{county.name} County</span>
                        <span className="t-label shrink-0 transition-colors group-hover:text-accent">
                          {county.raters === null
                            ? 'View →'
                            : county.raters === 0
                              ? 'None yet →'
                              : `${county.raters} ${county.raters === 1 ? 'rater' : 'raters'} →`}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {panel.partial.length > 0 && (
                <div className="mt-5">
                  <p className="t-label">Has towns in this zone</p>
                  <p className="mt-1.5 text-sm">
                    {panel.partial.map((county, i) => (
                      <span key={county.slug}>
                        {i > 0 && ', '}
                        <Link
                          href={`/directory/county/${county.slug}`}
                          className="font-medium text-ink underline decoration-rule underline-offset-4 hover:text-accent hover:decoration-accent"
                        >
                          {county.name} County
                        </Link>
                      </span>
                    ))}
                  </p>
                  <p className="mt-1.5 max-w-[52ch] text-xs text-muted">
                    The CEC publishes zones by ZIP, and these counties aren&rsquo;t in that source —
                    their towns are. So the towns are placed and the county isn&rsquo;t claimed.
                  </p>
                </div>
              )}

              {panel.counties.length === 0 && panel.partial.length === 0 && (
                <p className="mt-3 text-sm">
                  No county in the directory is mapped to this zone yet.
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
