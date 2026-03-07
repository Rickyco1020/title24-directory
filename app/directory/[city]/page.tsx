import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CITIES } from '@/lib/california-data'
import RaterCard from '@/components/RaterCard'
import Breadcrumb from '@/components/Breadcrumb'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  return CITIES.map(city => ({ city: city.slug }))
}

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const city = CITIES.find(c => c.slug === params.city)
  if (!city) return {}
  return {
    title: `HERS Raters in ${city.name}, CA | Title 24 Directory`,
    description: `Find certified HERS raters, ECC raters, and Title 24 acceptance testers in ${city.name}, California.`,
    alternates: { canonical: `https://title24directory.com/directory/${city.slug}` },
  }
}

export default async function CityPage({ params }: { params: { city: string } }) {
  const city = CITIES.find(c => c.slug === params.city)
  if (!city) notFound()

  const { data: raters } = await supabase
    .from('raters')
    .select('*')
    .in('status', ['approved', 'featured'])
    .contains('counties_served', [city.county])
    .order('status', { ascending: false })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://title24directory.com' },
      { '@type': 'ListItem', position: 2, name: 'Directory', item: 'https://title24directory.com/directory' },
      { '@type': 'ListItem', position: 3, name: city.county, item: `https://title24directory.com/directory/county/${city.county_slug}` },
      { '@type': 'ListItem', position: 4, name: city.name, item: `https://title24directory.com/directory/${city.slug}` },
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

      {raters && raters.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {raters.map((rater: any) => <RaterCard key={rater.id} rater={rater} />)}
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
          Title 24 raters in {city.name} are certified professionals who perform field inspections to verify that a building's energy systems — including HVAC, insulation, windows, and lighting — meet California's requirements. Without a certified rater's sign-off, a building permit cannot be finalized.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Whether you're a contractor, builder, or homeowner in {city.name}, finding a qualified local rater early in your project can save time and avoid costly delays. Use our directory to find HERS raters and ECC raters serving {city.name} and the broader {city.county} County area.
        </p>
      </div>

      <div className="text-center">
        <p className="text-gray-500 mb-4">Are you a Title 24 rater serving {city.name}?</p>
        <Link href="/get-listed" className="text-blue-700 font-semibold hover:underline">Get your business listed free</Link>
      </div>
    </div>
  )
}
