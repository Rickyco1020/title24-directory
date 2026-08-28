import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CA_COUNTIES, CITIES } from '@/lib/california-data'
import { zonesForCounty, zoneCallout } from '@/lib/climate-zones'
import RaterCard from '@/components/RaterCard'
import Breadcrumb from '@/components/Breadcrumb'
import ZoneSheet from '@/components/ZoneSheet'
import Link from 'next/link'
import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/site'

export async function generateStaticParams() {
  return CA_COUNTIES.map(county => ({ county: county.slug }))
}

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ county: string }> }): Promise<Metadata> {
  const { county: countySlug } = await params
  const county = CA_COUNTIES.find(c => c.slug === countySlug)
  if (!county) return {}
  return {
    title: `HERS Raters in ${county.name} County, CA | Title 24 Directory`,
    description: `Find certified HERS raters, ECC raters, and Title 24 acceptance testers in ${county.name} County, California.`,
    alternates: { canonical: absoluteUrl(`/directory/county/${county.slug}`) },
  }
}

export default async function CountyPage({ params }: { params: Promise<{ county: string }> }) {
  const { county: countySlug } = await params
  const county = CA_COUNTIES.find(c => c.slug === countySlug)
  if (!county) notFound()

  const { data: raters } = await supabase
    .from('raters')
    .select('*')
    .in('status', ['approved', 'featured'])
    .contains('counties_served', [countySlug])
    .order('status', { ascending: false })

  const citiesInCounty = CITIES.filter(c => c.county_slug === countySlug)

  // Empty until lib/climate-zones is filled from the CEC reference. Until
  // then the hero draws the plain base sheet and the page makes no zone claim.
  const zones = zonesForCounty(countySlug)
  const callout = zoneCallout(countySlug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Directory', item: absoluteUrl('/directory') },
      { '@type': 'ListItem', position: 3, name: `${county.name} County`, item: absoluteUrl(`/directory/county/${county.slug}`) },
    ],
  }

  const count = raters?.length ?? 0

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ZoneSheet activeZones={zones}>
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Directory', href: '/directory' },
          { label: `${county.name} County` },
        ]} />

        <h1 className="max-w-[16ch] text-[clamp(1.7rem,3.8vw,2.6rem)] font-bold leading-[1.05]">
          Title 24 raters serving <span className="marked">{county.name} County</span>.
        </h1>
        <p className="mt-4 max-w-[50ch] text-[0.98rem] leading-relaxed">
          Certified HERS and ECC raters, commissioning agents, and acceptance testers covering{' '}
          {county.name} County, California.
        </p>

        <dl className="title-block mt-7">
          <div>
            <dt className="t-label">Raters</dt>
            <dd className="mt-0.5 font-bold text-ink">{count}</dd>
          </div>
          {callout && (
            <div>
              <dt className="t-label">Climate zone</dt>
              <dd className="mt-0.5 font-bold text-ink">{callout.replace(/^Zones? /, '')}</dd>
            </div>
          )}
          <div>
            <dt className="t-label">Cities</dt>
            <dd className="mt-0.5 font-bold text-ink">{citiesInCounty.length}</dd>
          </div>
        </dl>
      </ZoneSheet>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        {count > 0 ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {raters!.map((rater: any) => <RaterCard key={rater.id} rater={rater} />)}
          </div>
        ) : (
          <div className="border-t border-ink py-14 text-center">
            <p className="text-xl font-bold text-ink">No raters listed yet in {county.name} County</p>
            <p className="mx-auto mt-2 mb-7 max-w-[50ch] text-[0.95rem]">
              Be the first Title 24 rater listed here and pick up the local leads.
            </p>
            <Link href="/get-listed" className="btn-accent px-5 py-2.5 text-sm">
              Get listed free
            </Link>
          </div>
        )}

        {citiesInCounty.length > 0 && (
          <section className="mt-14">
            <h2 className="text-lg font-bold">Cities in {county.name} County</h2>
            <ul className="cell-grid mt-5 sm:grid-cols-2 lg:grid-cols-4">
              {citiesInCounty.map(city => (
                <li key={city.slug}>
                  <Link
                    href={`/directory/${city.slug}`}
                    className="block bg-surface px-4 py-2.5 text-sm text-ink transition-colors hover:bg-accent-wash hover:text-accent"
                  >
                    {city.name}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="mt-14 border-t border-rule pt-5 text-sm">
          <Link
            href="/get-listed"
            className="font-semibold text-accent underline decoration-accent-rule underline-offset-4 hover:decoration-accent"
          >
            Are you a rater serving {county.name} County? Get listed free →
          </Link>
        </p>
      </div>
    </>
  )
}
