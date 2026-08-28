import Link from 'next/link'

/**
 * "climate zones 6, 8, 9, 14 and 16", with every number linked to its page.
 *
 * The prose version of what the hero map now does. It exists so the zone pages
 * are reachable from a county or city page by keyboard and by crawler: the map
 * itself is aria-hidden decoration, and decoration is not a navigation path.
 */
export default function ZoneLinks({ zones }: { zones: readonly string[] }) {
  if (!zones.length) return null

  const link = (zone: string) => (
    <Link
      key={zone}
      href={`/directory/zone/${zone}`}
      className="font-medium text-ink underline decoration-rule underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
    >
      {zone}
    </Link>
  )

  return (
    <>
      climate {zones.length === 1 ? 'zone' : 'zones'}{' '}
      {zones.map((zone, i) => (
        <span key={zone}>
          {i > 0 && (i === zones.length - 1 ? ' and ' : ', ')}
          {link(zone)}
        </span>
      ))}
    </>
  )
}
