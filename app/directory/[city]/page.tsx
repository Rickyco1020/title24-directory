import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CITIES } from '@/lib/california-data'
import { absoluteUrl } from '@/lib/site'
import RaterCard from '@/components/RaterCard'
import Breadcrumb from '@/components/Breadcrumb'
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Directory', href: '/directory' },
        { label: city.county, href: `/directory/county/${city.county_slug}` },
        { label: city.name },
      ]} />

      <h1 className="text-3xl font-bold text-gray-900 mb-2">HERS Raters in {city.name}, CA</h1>
      <p className="text-gray-500 mb-8">Find certified Title 24 compliance professionals serving {city.name}, {city.county} County</p>

      {all.length > 0 ? (
        <div className="mb-12">
          {listsCity.length > 0 && (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Raters listing {city.name} specifically
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                {listsCity.length} rater{listsCity.length !== 1 ? 's' : ''} name {city.name} in their service area.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                {listsCity.map(r => <RaterCard key={r.id} rater={r} />)}
              </div>
            </>
          )}

          {countyOnly.length > 0 && (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {listsCity.length > 0 ? `Also serving ${city.name}` : `Serving ${city.name}`}
              </h2>
              <p className="text-gray-500 text-sm mb-4">
                {countyOnly.length} rater{countyOnly.length !== 1 ? 's' : ''} cover{countyOnly.length === 1 ? 's' : ''} all of {city.county} County.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {countyOnly.map(r => <RaterCard key={r.id} rater={r} />)}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="bg-blue-50 rounded-2xl p-10 text-center mb-12">
          <p className="text-xl font-bold text-gray-800 mb-2">No raters listed yet in {city.name}</p>
          <p className="text-gray-500 mb-6">Be the first Title 24 rater listed in {city.name} and start getting local leads.</p>
          <Link href="/get-listed" className="bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors inline-block">
            Get Listed Free
          </Link>
        </div>
      )}

      <div className="bg-gray-50 rounded-2xl p-8 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Title 24 Compliance in {city.name}, CA</h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          All new residential and commercial construction in {city.name}, California must comply with Title 24, the California Building Energy Efficiency Standards. This includes HERS (Home Energy Rating System) verification for new homes and major renovations, ECC (Energy Code Compliance) verification for applicable projects, and acceptance testing for mechanical systems.
        </p>
        <p className="text-gray-600 leading-relaxed mb-4">
          Title 24 raters in {city.name} are certified professionals who perform field inspections to verify that a building&apos;s energy systems — including HVAC, insulation, windows, and lighting — meet California&apos;s requirements. Without a certified rater&apos;s sign-off, a building permit cannot be finalized.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Whether you&apos;re a contractor, builder, or homeowner in {city.name}, finding a qualified local rater early in your project can save time and avoid costly delays. Use our directory to find HERS raters and ECC raters serving {city.name} and the broader {city.county} County area.
        </p>
      </div>

      <div className="text-center">
        <p className="text-gray-500 mb-4">Are you a Title 24 rater serving {city.name}?</p>
        <Link href="/get-listed" className="text-blue-700 font-semibold hover:underline">Get your business listed free</Link>
      </div>
    </div>
  )
}
