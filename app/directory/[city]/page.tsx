import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CITIES } from '@/lib/california-data'
import { zonesForCity, zoneCallout } from '@/lib/climate-zones'
import { absoluteUrl } from '@/lib/site'
import { escapeForJsonLd } from '@/lib/security'
import { PLACE_CARD_LIMIT, cityHasListings, placeListingCounts } from '@/lib/rater-counts'
import RaterCard from '@/components/RaterCard'
import Breadcrumb from '@/components/Breadcrumb'
import ZoneSheet from '@/components/ZoneSheet'
import ZoneLinks from '@/components/ZoneLinks'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  return CITIES.map(city => ({ city: city.slug }))
}

export const revalidate = 3600

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city: citySlug } = await params
  const city = CITIES.find(c => c.slug === citySlug)
  if (!city) return {}
  const hasListings = cityHasListings(await placeListingCounts(), city.slug)
  return {
    title: `HERS Raters in ${city.name}, CA`,
    description: `Find certified HERS raters, ECC raters, and Title 24 acceptance testers in ${city.name}, California.`,
    alternates: { canonical: absoluteUrl(`/directory/${city.slug}`) },
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

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: citySlug } = await params
  const city = CITIES.find(c => c.slug === citySlug)
  if (!city) notFound()

  // This page used to filter on counties_served alone, which meant every city
  // in a county returned that county's entire roster — Irvine, Anaheim and
  // Tustin were byte-identical pages, each claiming to list raters "serving"
  // that one city, and each contradicting what /directory?q=Irvine returned.
  //
  // Now: raters who name this city explicitly, plus raters who cover the whole
  // county (they do serve the city — they just haven't singled it out). The two
  // are shown as separate groups so the page is honest about which is which,
  // and so it differs from its neighbours.
  //
  // Two queries rather than one OR'd query, and both bounded. The union used to
  // come back whole and get split in JavaScript, which meant the page fetched
  // and rendered the entire county roster; it also meant a cap could only fall
  // on whichever rows the database happened to return first, so the raters who
  // actually name this city could be crowded out by the county-wide ones. Split
  // at the source and each group gets its own ceiling — and the fragile
  // interpolated `.or()` filter string, along with the fallback that existed
  // only to catch it, goes away.
  const base = (opts?: { count: 'exact' }) =>
    supabase
      .from('raters')
      .select('*', opts)
      .in('status', ['approved', 'featured'])
      .order('status', { ascending: false })
      // Without a unique tiebreaker Postgres may order ties differently between
      // calls, so a capped list could shuffle between rebuilds.
      .order('id', { ascending: true })
      .range(0, PLACE_CARD_LIMIT - 1)

  // Cached per request (React `cache`), and generateMetadata already asked for
  // it, so this costs nothing.
  const placeCounts = await placeListingCounts()

  const [cityRes, countyRes] = await Promise.all([
    // The exact count rides along on the same request, in the Content-Range
    // header. It is the only honest way to say "showing the first 50 of N" for
    // this group, since the rows themselves stop at 50.
    base({ count: 'exact' }).contains('cities_served', [city.slug]),
    base().contains('counties_served', [city.county_slug]),
  ])

  const listsCity = cityRes.data ?? []
  const cityIds = new Set(listsCity.map(r => r.id))
  const countyOnly = (countyRes.data ?? []).filter(r => !cityIds.has(r.id))

  // Totals for the header and the "there are more" lines.
  //
  // The union total comes from placeListingCounts() rather than from these two
  // queries: `cities` there is already the count of raters who name this city OR
  // cover its county, deduplicated, and it is the same number the noindex rule
  // and the sitemap decide on. Adding the two query counts instead would
  // double-count anyone who is in both groups, and the page would then disagree
  // with the sitemap about whether it has anything on it.
  //
  // Everything falls back to what was actually fetched. A page that rendered
  // nothing must not claim a roster it is not showing, so a failed query reads
  // as zero and lands on the empty state exactly as it did before.
  const fetchedTotal = listsCity.length + countyOnly.length
  const unionTotal = fetchedTotal > 0 ? (placeCounts?.cities.get(city.slug) ?? fetchedTotal) : 0

  // Raters naming this city are never truncated to make room for county-wide
  // ones — they are the reason this page is not its neighbour.
  const listsCityTotal = Math.max(cityRes.count ?? listsCity.length, listsCity.length)
  // |county-only| = |union| − |names the city|, exactly: county-only is defined
  // as the union minus that group. So this stays consistent with the header
  // without a third query.
  const countyOnlyTotal = Math.max(unionTotal - listsCityTotal, countyOnly.length)

  const shownCountyOnly = countyOnly.slice(0, Math.max(PLACE_CARD_LIMIT - listsCity.length, 0))
  const listsCityCapped = listsCityTotal > listsCity.length
  const countyOnlyCapped = countyOnlyTotal > shownCountyOnly.length

  // The city's own CEC zone where the ZIP→place source has it, the county's
  // set otherwise. Empty for the seven counties that source doesn't cover, in
  // which case the hero draws the plain base sheet and claims nothing.
  const zones = zonesForCity(city.slug, city.county_slug)
  const callout = zoneCallout(zones)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Directory', item: absoluteUrl('/directory') },
      { '@type': 'ListItem', position: 3, name: city.county, item: absoluteUrl(`/directory/county/${city.county_slug}`) },
      { '@type': 'ListItem', position: 4, name: city.name, item: absoluteUrl(`/directory/${city.slug}`) },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: escapeForJsonLd(jsonLd) }} />

      <ZoneSheet activeZones={zones} linkZones>
        <Breadcrumb items={[
          { label: 'Home', href: '/' },
          { label: 'Directory', href: '/directory' },
          { label: city.county, href: `/directory/county/${city.county_slug}` },
          { label: city.name },
        ]} />

        <h1 className="max-w-[16ch] text-[clamp(1.7rem,3.8vw,2.6rem)] font-bold leading-[1.05]">
          Title 24 raters in <span className="marked">{city.name}</span>.
        </h1>
        <p className="mt-4 max-w-[50ch] text-[0.98rem] leading-relaxed">
          Certified compliance professionals serving {city.name} and the wider {city.county} County
          area
          {zones.length > 0 && (
            <>
              , in CEC <ZoneLinks zones={zones} />
            </>
          )}
          .
        </p>

        <dl className="title-block mt-7">
          <div>
            <dt className="t-label">Raters</dt>
            <dd className="mt-0.5 font-bold text-ink">{unionTotal}</dd>
          </div>
          <div>
            <dt className="t-label">County</dt>
            <dd className="mt-0.5 font-bold text-ink">{city.county}</dd>
          </div>
          {callout && (
            <div>
              <dt className="t-label">{zones.length > 1 ? 'Climate zones' : 'Climate zone'}</dt>
              <dd className="mt-0.5 font-bold text-ink">{callout}</dd>
            </div>
          )}
        </dl>
      </ZoneSheet>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
        {unionTotal > 0 ? (
          <>
            {listsCity.length > 0 && (
              <section className="mb-12">
                <h2 className="text-lg font-bold">Raters listing {city.name} specifically</h2>
                <p className="mt-1.5 mb-5 text-sm">
                  {listsCityTotal} rater{listsCityTotal !== 1 ? 's' : ''} name {city.name} in their
                  service area.
                  {listsCityCapped && ` Showing the first ${listsCity.length}.`}
                </p>
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {listsCity.map(r => <RaterCard key={r.id} rater={r} />)}
                </div>
                {listsCityCapped && (
                  <p className="mt-6 text-sm">
                    <Link
                      href={`/directory?q=${encodeURIComponent(city.name)}`}
                      className="font-semibold text-accent underline decoration-accent-rule underline-offset-4 hover:decoration-accent"
                    >
                      See all {listsCityTotal} raters serving {city.name} →
                    </Link>
                  </p>
                )}
              </section>
            )}

            {countyOnlyTotal > 0 && (
              <section>
                <h2 className="text-lg font-bold">
                  {listsCity.length > 0 ? `Also serving ${city.name}` : `Serving ${city.name}`}
                </h2>
                <p className="mt-1.5 mb-5 text-sm">
                  {countyOnlyTotal} rater{countyOnlyTotal !== 1 ? 's' : ''} cover
                  {countyOnlyTotal === 1 ? 's' : ''} all of {city.county} County.
                  {countyOnlyCapped && ` Showing ${shownCountyOnly.length}.`}
                </p>
                {shownCountyOnly.length > 0 && (
                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    {shownCountyOnly.map(r => <RaterCard key={r.id} rater={r} />)}
                  </div>
                )}
                {countyOnlyCapped && (
                  <p className="mt-6 text-sm">
                    <Link
                      href={`/directory?county=${city.county_slug}`}
                      className="font-semibold text-accent underline decoration-accent-rule underline-offset-4 hover:decoration-accent"
                    >
                      See all {countyOnlyTotal} raters covering {city.county} County →
                    </Link>
                  </p>
                )}
              </section>
            )}
          </>
        ) : (
          <div className="border-t border-ink py-14 text-center">
            <p className="text-xl font-bold text-ink">No raters listed yet in {city.name}</p>
            <p className="mx-auto mt-2 mb-7 max-w-[50ch] text-[0.95rem]">
              Be the first Title 24 rater listed in {city.name} and start picking up local leads.
            </p>
            <Link href="/get-listed" className="btn-accent px-5 py-2.5 text-sm">
              Get listed free
            </Link>
          </div>
        )}

        {/* ── Local SEO body. Set as prose at a readable measure rather than
               a grey rounded panel bolted to the bottom of the page. ── */}
        <section className="mt-16 border-t border-ink pt-8">
          <h2 className="text-lg font-bold">Title 24 compliance in {city.name}, California</h2>
          <div className="mt-4 max-w-[70ch] space-y-4 leading-relaxed">
            <p>
              All new residential and commercial construction in {city.name} must comply with Title
              24, the California Building Energy Efficiency Standards. That covers HERS verification
              for new homes and major renovations, ECC verification for applicable projects, and
              acceptance testing for mechanical systems.
            </p>
            <p>
              Title 24 raters in {city.name} are certified professionals who perform field
              inspections to verify that a building&rsquo;s energy systems, including HVAC,
              insulation, windows and lighting, meet California&rsquo;s requirements. Without a
              certified rater&rsquo;s sign-off, a building permit cannot be finalised.
            </p>
            <p>
              Whether you&rsquo;re a contractor, builder or homeowner, lining up a qualified local
              rater early saves time and avoids the kind of delay that only shows up the week your
              inspection is scheduled.
            </p>
          </div>
        </section>

        <p className="mt-12 border-t border-rule pt-5 text-sm">
          <Link
            href="/get-listed"
            className="font-semibold text-accent underline decoration-accent-rule underline-offset-4 hover:decoration-accent"
          >
            Are you a Title 24 rater serving {city.name}? Get listed free →
          </Link>
        </p>
      </div>
    </>
  )
}
