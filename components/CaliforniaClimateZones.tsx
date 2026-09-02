import { CZ_VIEWBOX, CZ_ZONES, zoneSpriteHref } from '@/lib/zone-map'

/**
 * California's sixteen CEC building climate zones, drawn as the hero watermark.
 *
 * The geometry is NOT in this file. It lives in `public/climate-zones.svg`
 * (generated from lib/zone-geometry.ts by scripts/build-zone-sprite.ts) and each
 * zone is pulled in with <use href="/climate-zones.svg#cz-N">.
 *
 * Why: this component renders on the homepage and on all 546 city, county and
 * zone pages, and a server-rendered tree is serialized twice — once as HTML and
 * again into the RSC flight payload. Inline, that put ~34 KB of path strings on
 * every one of those pages twice over; /directory/los-angeles was 258 KB of HTML
 * to deliver 17 KB of visible text. As a <use> reference the browser fetches and
 * caches the shapes once for the whole site.
 *
 * External <use> is same-origin only, which this is, and it is supported
 * everywhere that matters (Chrome, Safari, Firefox, Edge — the polyfill era was
 * IE and Edge 12). Verified in a browser before committing to it: the reference
 * resolves, the cloned geometry keeps its coordinates, `currentColor` and the
 * paint attributes below inherit into it, and the shapes hit-test as the <use>
 * element so the links and the homepage picker's handlers still work.
 *
 * One consequence, and it is the reason app/globals.css says `a:hover use`
 * rather than `a:hover path`: the cloned <path> lives in a shadow tree, so no
 * selector in the page can reach it. Everything is styled on the <use> instead,
 * which works because fill, stroke and their opacities are inherited properties.
 * The sprite therefore ships bare — paint baked into it there would win over
 * anything set here and could never be overridden.
 */

type Props = {
  className?: string
  /**
   * Zone numbers to redline. The base sheet is always drawn in graphite;
   * anything listed here is redrawn on top in red, the way a correction
   * sits over a base drawing. Pass nothing for the plain base sheet.
   */
  activeZones?: readonly string[]
  /**
   * Wrap every zone in a link to its page. Plain SVG anchors, not a router
   * click handler: the map then works with no JavaScript at all and this stays
   * a server component. They carry tabIndex={-1} because the SVG is aria-hidden
   * — focusable content inside hidden content is a trap, and the prose above
   * the map carries the same links where a keyboard can reach them.
   */
  linkZones?: boolean
}

export default function CaliforniaClimateZones({
  className = '',
  activeZones,
  linkZones = false,
}: Props) {
  // Filtering from CZ_ZONES rather than mapping over activeZones keeps draw
  // order stable and silently ignores a zone number that isn't on the map.
  const marked = activeZones?.length ? CZ_ZONES.filter(z => activeZones.includes(z.z)) : []

  return (
    <svg
      viewBox={CZ_VIEWBOX}
      className={className}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Base sheet: the whole state in graphite hairline. `currentColor` is
          set by the wrapping element, so the same geometry serves the light
          hero and any future inverted surface without a second copy. */}
      <g
        className="text-ink"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinejoin="round"
        opacity={0.88}
      >
        {CZ_ZONES.map(zone => {
          const shape = (
            <use
              href={zoneSpriteHref(zone.z)}
              fill="currentColor"
              fillOpacity={zone.o}
              strokeOpacity={0.28}
            />
          )
          return linkZones ? (
            <a key={zone.z} href={`/directory/zone/${zone.z}`} tabIndex={-1}>
              {/* One string child, not `Climate zone {zone.z}`. React treats
                  every <title> as document metadata and refuses to render an
                  array of children into one, so the split form served an empty
                  <title> and then hydrated a filled one — the whole page
                  re-rendered on the client (React #418), which wiped whatever
                  had already been typed into the hero search box. */}
              <title>{`Climate zone ${zone.z}`}</title>
              {shape}
            </a>
          ) : (
            <g key={zone.z}>{shape}</g>
          )
        })}
      </g>

      {marked.length > 0 && (
        <g
          className="pointer-events-none text-accent"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinejoin="round"
        >
          {marked.map(zone => (
            <use
              key={`mark-${zone.z}`}
              href={zoneSpriteHref(zone.z)}
              fill="currentColor"
              fillOpacity={0.1}
              strokeOpacity={0.95}
            />
          ))}
        </g>
      )}
    </svg>
  )
}
