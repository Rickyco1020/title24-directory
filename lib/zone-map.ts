// The climate-zone map, minus the geometry.
//
// Everything a renderer needs to draw the CEC zone map *except* the path data:
// zone numbers, each zone's base fill opacity, the viewBox, and where the shapes
// actually live. The shapes are in `public/climate-zones.svg`, referenced with
// <use>, so the ~32 KB of path strings is fetched and cached once by the browser
// instead of being serialized into every page — twice, once as markup and again
// in the RSC flight payload.
//
// This module is deliberately tiny and client-safe: components/ZoneMapNav.tsx is
// a client component, and anything it imports ships in the browser bundle.
//
// `o` is duplicated from lib/zone-geometry.ts on purpose rather than read from
// it. It cannot be baked into the sprite: a presentation attribute on the
// referenced <path> lives inside the shadow tree and wins over anything the host
// document sets on the <use>, which would freeze every zone at one opacity and
// kill both the active-zone redline and the hover state. So the sprite carries
// bare geometry and the host supplies all paint. scripts/build-zone-sprite.ts
// asserts the two lists still agree, in both generate and --check mode.

export type ZoneStyle = {
  z: string
  /** Base fill opacity for the watermark's graphite base sheet. */
  o: number
}

export const CZ_VIEWBOX = '0 0 1000.0 1153.7'

/** The sprite the geometry lives in. Same-origin, so <use> is allowed to load it. */
export const CZ_SPRITE_URL = '/climate-zones.svg'

/** The id a zone's <path> carries inside the sprite. */
export function zoneSpriteHref(zone: string): string {
  return `${CZ_SPRITE_URL}#cz-${zone}`
}

/** Zones in map draw order, with the watermark's base opacity for each. */
export const CZ_ZONES: readonly ZoneStyle[] = [
  { z: '1', o: 0.16 },
  { z: '2', o: 0.09 },
  { z: '3', o: 0.2 },
  { z: '4', o: 0.13 },
  { z: '5', o: 0.2 },
  { z: '6', o: 0.09 },
  { z: '7', o: 0.16 },
  { z: '8', o: 0.2 },
  { z: '9', o: 0.13 },
  { z: '10', o: 0.2 },
  { z: '11', o: 0.13 },
  { z: '12', o: 0.16 },
  { z: '13', o: 0.09 },
  { z: '14', o: 0.2 },
  { z: '15', o: 0.13 },
  { z: '16', o: 0.07 },
]

/** Every zone number the map knows about, in map order. */
export const CZ_NUMBERS = CZ_ZONES.map(z => z.z)
