import CaliforniaClimateZones from '@/components/CaliforniaClimateZones'

type Props = {
  /**
   * Zone numbers to redline. Omit for the plain base sheet (the homepage
   * state); pass a county's zones to mark them (the county/city state).
   */
  activeZones?: readonly string[]
  /**
   * Draw the watermark map. On by default everywhere, including the
   * homepage — the hero map is the first climate-zone cue a visitor sees;
   * the interactive picker further down the homepage is the deep version
   * of the same map, not a replacement for it.
   */
  showMap?: boolean
  /** Make the watermark map clickable — every zone links to its own page. */
  linkZones?: boolean
  children: React.ReactNode
}

/**
 * The hero surface: drafting grid, the CEC zone map, and the copy on top.
 *
 * The map is decoration on the homepage and information on a place page,
 * so it is one component with one switch rather than two heroes that drift
 * apart. Zone numbers are never invented here — callers pass what
 * lib/climate-zones knows, which is nothing until that table is filled.
 */
export default function ZoneSheet({
  activeZones,
  showMap = true,
  linkZones = false,
  children,
}: Props) {
  const marked = Boolean(activeZones?.length)

  return (
    <section className="relative isolate overflow-hidden border-b border-ink bg-paper">
      <div className="sheet-grid" aria-hidden="true" />

      {showMap && (
        <div
          className={`sheet-map${linkZones ? ' sheet-map--links' : ''}`}
          aria-hidden="true"
        >
          <CaliforniaClimateZones activeZones={activeZones} linkZones={linkZones} />
        </div>
      )}

      <div
        className={`relative z-[2] mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8${
          linkZones ? ' sheet-content--pass' : ''
        }`}
      >
        {children}
      </div>

      {showMap && (
        <p className="sheet-legend t-label" aria-hidden="true">
          <span
            className={`inline-block h-[9px] w-[9px] rounded-[2px] ${marked ? 'bg-accent' : 'bg-ink/30'}`}
          />
          {marked ? 'Active zone' : 'CEC building climate zones 1–16'}
        </p>
      )}
    </section>
  )
}
