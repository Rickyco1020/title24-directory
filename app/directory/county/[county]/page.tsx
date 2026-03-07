import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CA_COUNTIES, CITIES } from '@/lib/california-data'
import RaterCard from '@/components/RaterCard'
import Breadcrumb from '@/components/Breadcrumb'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateStaticParams() {
  return CA_COUNTIES.map(county => ({ county: county.slug }))
}

export async function generateMetadata({ params }: { params: { county: string } }): Promise<Metadata> {
  const county = CA_COUNTIES.find(c => c.slug === params.county)
  if (!county) return {}
  return {
    title: `HERS Raters in ${county.name} County, CA | Title 24 Directory`,
    description: `Find certified HERS raters, ECC raters, and Title 24 acceptance testers in ${county.name} County, California.`,
    alternates: { canonical: `https://title24directory.com/directory/county/${county.slug}` },
  }
}

export default async function CountyPage({ params }: { params: { county: string } }) {
  const county = CA_COUNTIES.find(c => c.slug === params.county)
  if (!county) notFound()

  const { data: raters } = await supabase
    .from('raters')
    .select('*')
    .in('status', ['approved', 'featured'])
    .contains('counties_served', [params.county])
    .order('status', { ascending: false })

  const citiesInCounty = CITIES.filter(c => c.county_slug === params.county)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://title24directory.com' },
      { '@type': 'ListItem', position: 2, name: 'Directory', item: 'https://title24directory.com/directory' },
      { '@type': 'ListItem', position: 3, name: `${county.name} County`, item: `https://title24directory.com/directory/county/${county.slug}` },
    ],
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Directory', href: '/directory' },
        { label: `${county.name} County` },
      ]} />

      <h1 className="text-3xl font-bold text-gray-900 mb-2">HERS Raters in {county.name} County, CA</h1>
      <p className="text-gray-500 mb-8">Find certified Title 24 compliance professionals serving {county.name} County</p>

      {raters && raters.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {raters.map((rater: any) => <RaterCard key={rater.id} rater={rater} />)}
        </div>
      ) : (
        <div className="bg-blue-50 rounded-2xl p-10 text-center mb-12">
          <p className="text-xl font-bold text-gray-800 mb-2">No raters listed yet in {county.name} County</p>
          <p className="text-gray-500 mb-6">Be the first Title 24 rater listed here.</p>
          <Link href="/get-listed" className="bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors inline-block">Get Listed Free</Link>
        </div>
      )}

      {citiesInCounty.length > 0 && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Cities in {county.name} County</h2>
          <div className="flex flex-wrap gap-2">
            {citiesInCounty.map(city => (
              <Link key={city.slug} href={`/directory/${city.slug}`} className="bg-white border border-gray-200 text-gray-700 text-sm px-3 py-1 rounded-lg hover:border-blue-400 hover:text-blue-700 transition-colors">
                {city.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="text-center">
        <Link href="/get-listed" className="text-blue-700 font-semibold hover:underline">Are you a rater serving {county.name} County? Get listed free</Link>
      </div>
    </div>
  )
}
