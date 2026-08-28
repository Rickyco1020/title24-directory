import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CITIES } from '@/lib/california-data'
import { zonesForCity, zoneCallout, zoneLabel } from '@/lib/climate-zones'
import { absoluteUrl } from '@/lib/site'
import RaterCard from '@/components/RaterCard'
import Breadcrumb from '@/components/Breadcrumb'
import ZoneSheet from '@/components/ZoneSheet'
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
  return {
    title: `HERS Raters in ${city.name}, CA | Title 24 Directory`,
    description: `Find certified HERS raters, ECC raters, and Title 24 acceptance testers in ${city.name}, California.`,
    alternates: { canonical: absoluteUrl(`/directory/${city.slug}`) },
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
  const base = () =>
    supabase
      .from('raters')
      .select('*')
      .in('status', ['approved', 'featured'])
      .order('status', { ascending: false })

  const primary = await base()
    .or(`cities_served.cs.{${city.slug}},counties_served.cs.{${city.county_slug}}`)
  let raters = primary.data

  // If the OR filter is ever rejected, fall back to county coverage alone
  // rather than serving an error on all 472 city pages. Same rows this page
  // showed before, just without the city-specific split.
  if (primary.error) {
    const fallback = await base().contains('counties_served', [city.county_slug])
    raters = fallback.data
  }

  const all = raters ?? []
  const listsCity = all.filter(r => (r.cities_served ?? []).includes(city.slug))
  const countyOnly = all.filter(r => !(r.cities_served ?? []).includes(city.slug))

  // The city's own CEC zone where the ZIP→place source has it, the county's
  // set otherwise. Empty for the seven counties that source doesn't cover, in
  // which case the hero draws the plain base sheet and claims nothing.
  const zones = zonesForCity(city.slug, city.county_slug)
  const callout = zoneCallout(zones)
  const label = zoneLabel(zones)

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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <ZoneSheet activeZones={zones}>
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
          area{label ? `, in CEC ${label}` : ''}.
        </p>

        <dl className="title-block mt-7">
          <div>
            <dt className="t-label">Raters</dt>
            <dd className="mt-0.5 font-bold text-ink">{all.length}</dd>
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
        {all.length > 0 ? (
          <>
            {listsCity.length > 0 && (
              <section className="mb-12">
                <h2 className="text-lg font-bold">Raters listing {city.name} specifically</h2>
                <p className="mt-1.5 mb-5 text-sm">
                  {listsCity.length} rater{listsCity.length !== 1 ? 's' : ''} name {city.name} in
                  their service area.
                </p>
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {listsCity.map(r => <RaterCard key={r.id} rater={r} />)}
                </div>
              </section>
            )}

            {countyOnly.length > 0 && (
              <section>
                <h2 className="text-lg font-bold">
                  {listsCity.length > 0 ? `Also serving ${city.name}` : `Serving ${city.name}`}
                </h2>
                <p className="mt-1.5 mb-5 text-sm">
                  {countyOnly.length} rater{countyOnly.length !== 1 ? 's' : ''} cover
                  {countyOnly.length === 1 ? 's' : ''} all of {city.county} County.
                </p>
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {countyOnly.map(r => <RaterCard key={r.id} rater={r} />)}
                </div>
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
