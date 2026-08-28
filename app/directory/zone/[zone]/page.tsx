import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { cityName, countyName } from '@/lib/california-data'
import { citiesForZone, countiesForZone } from '@/lib/climate-zones'
import { ratersByCounty, ratersInZone } from '@/lib/rater-counts'
import { CZ_NUMBERS } from '@/components/CaliforniaClimateZones'
import Breadcrumb from '@/components/Breadcrumb'
import ZoneSheet from '@/components/ZoneSheet'
import { absoluteUrl } from '@/lib/site'

export const revalidate = 3600

export function generateStaticParams() {
  return CZ_NUMBERS.map(zone => ({ zone }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ zone: string }>
}): Promise<Metadata> {
  const { zone } = await params
  if (!CZ_NUMBERS.includes(zone)) return {}
  const { full, partial } = countiesForZone(zone)
  const counties = full.length + partial.length
  return {
    // The layout appends " | Title 24 Directory" — 21 characters — so this
    // half has to stay short or the site name is what Google truncates.
    title: `HERS Raters in Climate Zone ${zone}, CA`,
    description: `Certified HERS and ECC raters, commissioning agents, and acceptance testers across CEC building climate zone ${zone}, California — ${counties} counties.`,
    alternates: { canonical: absoluteUrl(`/directory/zone/${zone}`) },
  }
}

/** The ruled cell of counties and cities. Same grid the homepage used to use. */
function CellGrid({ children }: { children: React.ReactNode }) {
  return <ul className="cell-grid mt-5 sm:grid-cols-2 lg:grid-cols-4">{children}</ul>
}

export default async function ZonePage({ params }: { params: Promise<{ zone: string }> }) {
  const { zone } = await params
  if (!CZ_NUMBERS.includes(zone)) notFound()

  const { full, partial } = countiesForZone(zone)
  const cities = citiesForZone(zone)
  const [countsByCounty, raterCount] = await Promise.all([
    ratersByCounty(),
    ratersInZone([...full, ...partial]),
  ])

  const countyCount = full.length + partial.length

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Directory', item: absoluteUrl('/directory') },
      {
        '@type': 'ListItem',
        position: 3,
        name: `Climate zone ${zone}`,
        item: absoluteUrl(`/directory/zone/${zone}`),
      },
    ],
  }

  const countyCell = (slug: string) => {
    const n = countsByCounty ? (countsByCounty.get(slug) ?? 0) : undefined
    return (
      <li key={slug}>
        <Link
          href={`/directory/county/${slug}`}
          className="group flex items-baseline justify-between gap-3 bg-surface px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-accent-wash hover:text-accent"
        >
          <span>{countyName(slug)}</span>
          {n !== undefined && (
            <span className="t-label shrink-0 transition-colors group-hover:text-accent">
              {n === 0 ? '—' : n}
            </span>
          )}
        </Link>
      </li>
    )
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ZoneSheet activeZones={[zone]}>
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Directory', href: '/directory' },
            { label: `Climate zone ${zone}` },
          ]}
        />

        <h1 className="max-w-[16ch] text-[clamp(1.7rem,3.8vw,2.6rem)] font-bold leading-[1.05]">
          Title 24 raters in <span className="marked">climate zone {zone}</span>.
        </h1>
        <p className="mt-4 max-w-[50ch] text-[0.98rem] leading-relaxed">
          Pick your county below to see who covers it. CEC building climate zone {zone} covers{' '}
          {countyCount} California {countyCount === 1 ? 'county' : 'counties'}
          {cities.length > 0 ? ` and ${cities.length} listed cities` : ''}.
        </p>

        <dl className="title-block mt-7">
          {raterCount !== null && (
            <div>
              <dt className="t-label">Raters</dt>
              <dd className="mt-0.5 font-bold text-ink">{raterCount}</dd>
            </div>
          )}
          <div>
            <dt className="t-label">Counties</dt>
            <dd className="mt-0.5 font-bold text-ink">{countyCount}</dd>
          </div>
          <div>
            <dt className="t-label">Climate zone</dt>
            <dd className="mt-0.5 font-bold text-ink">{zone}</dd>
          </div>
        </dl>
      </ZoneSheet>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        {full.length > 0 && (
          <section>
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <h2 className="text-lg font-bold">Counties in climate zone {zone}</h2>
              {countsByCounty && <p className="t-label">Number = raters listed</p>}
            </div>
            <CellGrid>{full.map(countyCell)}</CellGrid>
          </section>
        )}

        {partial.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-bold">Counties with towns in climate zone {zone}</h2>
            <p className="mt-2 max-w-[62ch] text-sm">
              The CEC publishes climate zones by ZIP code, and these counties aren&rsquo;t in that
              source — their towns are. So their towns are placed in zone {zone} and the county
              itself is not claimed either way.
            </p>
            <CellGrid>{partial.map(countyCell)}</CellGrid>
          </section>
        )}

        {full.length === 0 && partial.length === 0 && (
          <p className="text-[0.95rem]">
            No California county in the directory maps to this zone yet.
          </p>
        )}

        {cities.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-bold">Cities in climate zone {zone}</h2>
            <CellGrid>
              {cities.map(slug => (
                <li key={slug}>
                  <Link
                    href={`/directory/${slug}`}
                    className="block bg-surface px-4 py-2.5 text-sm text-ink transition-colors hover:bg-accent-wash hover:text-accent"
                  >
                    {cityName(slug)}
                  </Link>
                </li>
              ))}
            </CellGrid>
          </section>
        )}

        {/* Sixteen zones, every one a click from every other. Also how a
            crawler reaches the zones nobody links to from the map. */}
        <section className="mt-14 border-t border-rule pt-6">
          <p className="t-label">Other climate zones</p>
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {CZ_NUMBERS.map(n => (
              <li key={n}>
                <Link
                  href={`/directory/zone/${n}`}
                  aria-current={n === zone ? 'page' : undefined}
                  className={`block rounded border px-2.5 py-2 font-mono text-xs font-semibold transition-colors ${
                    n === zone
                      ? 'border-accent bg-accent text-white'
                      : 'border-rule bg-surface text-ink hover:border-accent hover:text-accent'
                  }`}
                >
                  {n}
                  <span className="sr-only"> — climate zone {n}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-10 border-t border-rule pt-5 text-sm">
          <Link
            href="/get-listed"
            className="font-semibold text-accent underline decoration-accent-rule underline-offset-4 hover:decoration-accent"
          >
            Are you a rater working in climate zone {zone}? Get listed free →
          </Link>
        </p>
      </div>
    </>
  )
}
