import { notFound } from 'next/navigation'
import { supabase, type Rater } from '@/lib/supabase'
import { CA_COUNTIES, CITIES } from '@/lib/california-data'
import { zonesForCounty, zoneCallout } from '@/lib/climate-zones'
import RaterCard from '@/components/RaterCard'
import Breadcrumb from '@/components/Breadcrumb'
import ZoneSheet from '@/components/ZoneSheet'
import ZoneLinks from '@/components/ZoneLinks'
import Link from 'next/link'
import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/site'
import { escapeForJsonLd } from '@/lib/security'
import { PLACE_CARD_LIMIT, countyHasListings, placeListingCounts } from '@/lib/rater-counts'

export async function generateStaticParams() {
  return CA_COUNTIES.map(county => ({ county: county.slug }))
}

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ county: string }> }): Promise<Metadata> {
  const { county: countySlug } = await params
  const county = CA_COUNTIES.find(c => c.slug === countySlug)
  if (!county) return {}
  const hasListings = countyHasListings(await placeListingCounts(), county.slug)
  return {
    title: `HERS Raters in ${county.name} County, CA`,
    description: `Find certified HERS raters, ECC raters, and Title 24 acceptance testers in ${county.name} County, California.`,
    alternates: { canonical: absoluteUrl(`/directory/county/${county.slug}`) },
    // 64 city and 24 county pages currently render zero listings, which makes
    // them ~95% identical to each other: the only per-page variables are the
    // place name and the county roll-up. Google's thin-content and doorway
    // classifiers are built for exactly that shape, and the risk is site-wide —
    // a large block of near-duplicate URLs can suppress the good ones. So a
    // place with nothing to list is kept (it is an honest landing page with a
    // real CTA, and it is one listing away from being useful) but asks not to
    // be indexed. `follow` is left on so the links out to the county and the
    // rest of the directory still carry equity. app/sitemap.ts drops the same
    // places using the same helper, so the sitemap and the page never disagree.
    ...(hasListings ? {} : { robots: { index: false, follow: true } }),
  }
}

export default async function CountyPage({ params }: { params: Promise<{ county: string }> }) {
  const { county: countySlug } = await params
  const county = CA_COUNTIES.find(c => c.slug === countySlug)
  if (!county) notFound()

  // Bounded. This query used to select the whole matching set, and this is the
  // page where that ceiling is highest — a county roster is the largest result
  // any place page can produce, and it is the same roster that fans out across
  // every city page in the county. Past the cap the page says so and hands off
  // to the paginated directory rather than drawing a thousand cards.
  const { data: raters } = await supabase
    .from('raters')
    .select('*')
    .in('status', ['approved', 'featured'])
    .contains('counties_served', [countySlug])
    .order('status', { ascending: false })
    // A stable tiebreaker, so a capped list does not reshuffle between builds.
    .order('id', { ascending: true })
    .range(0, PLACE_CARD_LIMIT - 1)

  const citiesInCounty = CITIES.filter(c => c.county_slug === countySlug)

  // Every zone the county touches, from the CEC ZIP mapping. Empty for the
  // seven counties the ZIP→place source doesn't cover, in which case the hero
  // draws the plain base sheet and the page makes no zone claim.
  const zones = zonesForCounty(countySlug)
  const callout = zoneCallout(zones)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Directory', item: absoluteUrl('/directory') },
      { '@type': 'ListItem', position: 3, name: `${county.name} County`, item: absoluteUrl(`/directory/county/${county.slug}`) },
    ],
  }

  // The header number is the true roster size, not the number of cards drawn —
  // and it comes from the same tally the noindex rule and the sitemap use, so
  // the three cannot disagree about whether this county has anyone on it.
  //
  // It falls back to what was actually fetched, and reads zero when nothing was:
  // if the query failed, the page renders its empty state and must not
  // simultaneously claim a roster it is not showing.
  const shown = raters ?? []
  const count = shown.length > 0 ? ((await placeListingCounts())?.counties.get(countySlug) ?? shown.length) : 0
  const capped = count > shown.length

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: escapeForJsonLd(jsonLd) }} />

      <ZoneSheet activeZones={zones} linkZones>
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
          {county.name} County, California
          {zones.length > 0 && (
            <>
              , which spans CEC <ZoneLinks zones={zones} />
            </>
          )}
          .
        </p>

        <dl className="title-block mt-7">
          <div>
            <dt className="t-label">Raters</dt>
            <dd className="mt-0.5 font-bold text-ink">{count}</dd>
          </div>
          {callout && (
            <div>
              <dt className="t-label">{zones.length > 1 ? 'Climate zones' : 'Climate zone'}</dt>
              <dd className="mt-0.5 font-bold text-ink">{callout}</dd>
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
          <>
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {shown.map((rater: Rater) => <RaterCard key={rater.id} rater={rater} />)}
            </div>
            {capped && (
              <p className="mt-8 border-t border-rule pt-5 text-sm">
                Showing {shown.length} of {count} raters covering {county.name} County.{' '}
                <Link
                  href={`/directory?county=${county.slug}`}
                  className="font-semibold text-accent underline decoration-accent-rule underline-offset-4 hover:decoration-accent"
                >
                  See all {count} →
                </Link>
              </p>
            )}
          </>
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
