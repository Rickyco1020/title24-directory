'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CZ_NUMBERS, CZ_VIEWBOX, CZ_ZONES, zoneSpriteHref } from '@/lib/zone-map'

export type TopCounty = { slug: string; name: string; raters: number; zones: readonly string[] }

export type ZoneMapNavProps = {
  /** Counties in each zone, for the caption under the map. */
  countiesPerZone: Record<string, number>
  /** Busiest counties — the shortcut for someone who already knows the name. */
  topCounties: TopCounty[]
}

/**
 * The homepage's zone map: point at where the job is, land on that zone's page.
 *
 * The SVG is `aria-hidden` and the numbered chips beside it are the real
 * control — sixteen plainly-named links rather than sixteen unlabelled shapes,
 * and the only usable target on a phone, where zone 7 is about the size of a
 * fingertip. Because they are ordinary links, all sixteen zone pages are in the
 * homepage HTML whether or not any JavaScript runs; the map only mirrors them.
 * Prefetch is off — sixteen speculative page loads to decorate a homepage is a
 * poor trade.
 *
 * The county shortcuts below light the map too. A county can span several
 * zones (Los Angeles touches five), so this is a second, independent hover
 * source rather than an alias for the first: `hovered` stays the single zone
 * a chip or map shape owns, `countyHover` carries a whole zone list, and a
 * map shape lights up if either one claims it.
 */
export default function ZoneMapNav({ countiesPerZone, topCounties }: ZoneMapNavProps) {
  const router = useRouter()
  const [hovered, setHovered] = useState<string | null>(null)
  const [countyHover, setCountyHover] = useState<{
    slug: string
    name: string
    zones: readonly string[]
  } | null>(null)

  const href = (zone: string) => `/directory/zone/${zone}`
  const leave = (zone: string) => () =>
    setHovered(current => (current === zone ? null : current))
  const countyLeave = (slug: string) => () =>
    setCountyHover(current => (current?.slug === slug ? null : current))

  return (
    <div className="mt-8 grid gap-x-10 gap-y-8 lg:grid-cols-12">
      <figure className="lg:col-span-5">
        <svg
          viewBox={CZ_VIEWBOX}
          className="mx-auto block h-[19rem] w-auto max-w-full sm:h-[24rem] lg:h-[30rem]"
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
          focusable="false"
        >
          {/* <use>, not <path>: the geometry lives in public/climate-zones.svg
              so it is fetched and cached once for the whole site instead of
              being serialized into this page's HTML, its RSC payload and the
              client bundle. Every paint attribute below is an inherited
              property, so it reaches the cloned shape; the shape hit-tests as
              this <use> element, so the handlers fire exactly as they did on
              the path. `vector-effect` is the one thing that cannot be set from
              here — it does not inherit — so it is baked into the sprite. */}
          {CZ_ZONES.map(zone => {
            const isLit = zone.z === hovered || (countyHover?.zones.includes(zone.z) ?? false)
            return (
              <use
                key={zone.z}
                href={zoneSpriteHref(zone.z)}
                onClick={() => router.push(href(zone.z))}
                onMouseEnter={() => setHovered(zone.z)}
                onMouseLeave={leave(zone.z)}
                className={`cursor-pointer transition-[fill-opacity,stroke-opacity] duration-150 ${
                  isLit ? 'text-accent' : 'text-ink'
                }`}
                fill="currentColor"
                fillOpacity={isLit ? 0.4 : zone.o}
                stroke="currentColor"
                strokeOpacity={isLit ? 0.95 : 0.28}
                strokeWidth={isLit ? 2 : 1}
                strokeLinejoin="round"
              />
            )
          })}
        </svg>

        <figcaption className="t-label mt-3 text-center">
          {hovered
            ? `Climate zone ${hovered} — ${countiesPerZone[hovered] ?? 0} ${
                countiesPerZone[hovered] === 1 ? 'county' : 'counties'
              }`
            : countyHover
              ? countyHover.zones.length > 0
                ? `${countyHover.name} County — climate zone${
                    countyHover.zones.length > 1 ? 's' : ''
                  } ${countyHover.zones.join(', ')}`
                : `${countyHover.name} County`
              : 'CEC building climate zones 1–16'}
        </figcaption>
      </figure>

      <div className="lg:col-span-7">
        <p className="max-w-[46ch] text-[0.95rem] leading-relaxed">
          Every California address sits in one of sixteen CEC building climate zones, and the zone
          drives what your Title 24 report has to show. Click where your project is — or pick a
          number — for the counties in that zone.
        </p>

        <ul className="mt-6 grid max-w-[30rem] grid-cols-4 gap-1.5 sm:grid-cols-8">
          {CZ_NUMBERS.map(zone => (
            <li key={zone}>
              <Link
                href={href(zone)}
                prefetch={false}
                onMouseEnter={() => setHovered(zone)}
                onMouseLeave={leave(zone)}
                onFocus={() => setHovered(zone)}
                onBlur={leave(zone)}
                className="block rounded border border-rule bg-surface px-2.5 py-2 text-center font-mono text-xs font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
              >
                {zone}
                <span className="sr-only"> — climate zone {zone}</span>
              </Link>
            </li>
          ))}
        </ul>

        {topCounties.length > 0 && (
          <div className="mt-7">
            <p className="t-label">Or go straight to a county</p>
            <ul className="mt-2 border-t border-rule sm:columns-2 sm:gap-x-10">
              {topCounties.map(county => (
                <li key={county.slug} className="break-inside-avoid border-b border-rule">
                  <Link
                    href={`/directory/county/${county.slug}`}
                    onMouseEnter={() =>
                      setCountyHover({ slug: county.slug, name: county.name, zones: county.zones })
                    }
                    onMouseLeave={countyLeave(county.slug)}
                    onFocus={() =>
                      setCountyHover({ slug: county.slug, name: county.name, zones: county.zones })
                    }
                    onBlur={countyLeave(county.slug)}
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
      </div>
    </div>
  )
}
