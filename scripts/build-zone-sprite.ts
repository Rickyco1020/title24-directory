/**
 * Generates public/climate-zones.svg — the CEC climate-zone geometry, as one
 * static file both renderers point <use> at.
 *
 *   npx tsx scripts/build-zone-sprite.ts           write the sprite
 *   npx tsx scripts/build-zone-sprite.ts --check    fail if it is out of date
 *
 * lib/zone-geometry.ts stays the source of truth; this file is the artifact.
 * Run this after touching the geometry, or the map is drawing something the
 * repo no longer describes.
 *
 * The paths are emitted bare — no fill, no stroke, no opacity. A presentation
 * attribute on the referenced <path> lives in the shadow tree that <use> clones
 * and beats anything the host document sets on the <use> element, so any paint
 * baked in here could never be overridden. That would freeze every zone at one
 * appearance and break both the active-zone redline on place pages and the
 * hover state on the homepage picker. `vector-effect` is the one exception: it
 * is not an inherited property, so it cannot be supplied by the host, and it is
 * the same value for every zone anyway.
 *
 * They also live inside <defs>, so opening the file directly renders nothing
 * rather than a sheet of solid black California.
 */
import { writeFileSync, readFileSync, existsSync } from 'fs'
import { resolve } from 'path'
import { CZ_VIEWBOX_SOURCE, ZONE_GEOMETRY } from '../lib/zone-geometry'
import { CZ_VIEWBOX, CZ_ZONES } from '../lib/zone-map'

const OUT = resolve(process.cwd(), 'public/climate-zones.svg')

/**
 * lib/zone-map.ts carries a copy of each zone's number and base opacity so the
 * client bundle never has to import the geometry. Copies drift; this is where
 * that gets caught.
 */
function assertMetadataInSync(): void {
  if (CZ_VIEWBOX !== CZ_VIEWBOX_SOURCE) {
    throw new Error(
      `viewBox mismatch: lib/zone-map.ts has "${CZ_VIEWBOX}", lib/zone-geometry.ts has "${CZ_VIEWBOX_SOURCE}"`,
    )
  }
  if (CZ_ZONES.length !== ZONE_GEOMETRY.length) {
    throw new Error(
      `zone count mismatch: lib/zone-map.ts has ${CZ_ZONES.length}, lib/zone-geometry.ts has ${ZONE_GEOMETRY.length}`,
    )
  }
  ZONE_GEOMETRY.forEach((zone, i) => {
    const style = CZ_ZONES[i]
    if (style.z !== zone.z) {
      throw new Error(`zone ${i} mismatch: lib/zone-map.ts says "${style.z}", geometry says "${zone.z}"`)
    }
    if (style.o !== zone.o) {
      throw new Error(`zone ${zone.z} opacity mismatch: lib/zone-map.ts has ${style.o}, geometry has ${zone.o}`)
    }
  })
}

function render(): string {
  const paths = ZONE_GEOMETRY.map(
    zone => `    <path id="cz-${zone.z}" vector-effect="non-scaling-stroke" d="${zone.d}"/>`,
  ).join('\n')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${CZ_VIEWBOX_SOURCE}">
  <!--
    GENERATED FILE - do not edit by hand.
    Source: lib/zone-geometry.ts. Rebuild: npx tsx scripts/build-zone-sprite.ts

    California Building Climate Zones (CEC, 2015 boundaries), referenced by
    components/CaliforniaClimateZones.tsx and components/ZoneMapNav.tsx with
    <use href="/climate-zones.svg#cz-N">. Deliberately unpainted: every fill,
    stroke and opacity is supplied by the page that references it.
  -->
  <defs>
${paths}
  </defs>
</svg>
`
}

const svg = render()
assertMetadataInSync()

if (process.argv.includes('--check')) {
  if (!existsSync(OUT)) {
    console.error('public/climate-zones.svg is missing. Run: npx tsx scripts/build-zone-sprite.ts')
    process.exit(1)
  }
  if (readFileSync(OUT, 'utf8') !== svg) {
    console.error('public/climate-zones.svg is out of date. Run: npx tsx scripts/build-zone-sprite.ts')
    process.exit(1)
  }
  console.log(`public/climate-zones.svg is up to date (${ZONE_GEOMETRY.length} zones).`)
} else {
  writeFileSync(OUT, svg)
  console.log(`Wrote public/climate-zones.svg — ${ZONE_GEOMETRY.length} zones, ${svg.length} bytes.`)
}
