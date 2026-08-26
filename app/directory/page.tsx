import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import RaterCard from '@/components/RaterCard'
import { CATEGORIES, categoryMatchValues } from '@/lib/categories'
import { CA_COUNTIES, CITIES, slugify } from '@/lib/california-data'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find a Title 24 Rater | California HERS & ECC Directory',
  description: 'Browse California\'s complete directory of HERS raters, ECC raters, commissioning agents, and acceptance testers. Filter by city, county, and service type.',
}

export const dynamic = 'force-dynamic'

async function DirectoryResults({ searchParams }: { searchParams: Record<string, string> }) {
  const { q, type, county, page } = searchParams
  const currentPage = parseInt(page ?? '1', 10)
  const perPage = 20
  const from = (currentPage - 1) * perPage
  const to = from + perPage - 1

  let query = supabase
    .from('raters')
    .select('*', { count: 'exact' })
    .in('status', ['approved', 'featured'])
    .order('status', { ascending: false })
    .range(from, to)

  if (type) query = query.overlaps('services', categoryMatchValues(type))
  // counties_served stores slugs ('los-angeles'). slugify() is idempotent, so this
  // accepts both the slug the form now submits and the display name older links carry.
  if (county) query = query.contains('counties_served', [slugify(county)])
  if (q) {
    // The box is labelled "Name, city, keyword", so a place name has to work.
    // counties_served / cities_served hold slugs, and array containment can't be
    // OR'd with an ilike in one PostgREST call — so resolve a recognised place to
    // its slug and filter on that; anything else stays a name/description search.
    const term = q.trim()
    const termSlug = slugify(term)
    const matchedCounty = CA_COUNTIES.find(c => c.slug === termSlug)
    const matchedCity = matchedCounty ? undefined : CITIES.find(c => c.slug === termSlug)

    if (matchedCounty) {
      query = query.contains('counties_served', [matchedCounty.slug])
    } else if (matchedCity) {
      query = query.contains('cities_served', [matchedCity.slug])
    } else {
      // or() takes a raw filter string; strip what would break out of it.
      const safe = term.replace(/[(),*\\]/g, ' ').trim()
      if (safe) query = query.or(`business_name.ilike.*${safe}*,description.ilike.*${safe}*`)
    }
  }

  const { data: raters, count } = await query

  const totalPages = Math.ceil((count ?? 0) / perPage)

  if (!raters?.length) {
    return (
      <div className="text-center py-16">
        <p className="text-2xl font-bold text-gray-700 mb-2">No raters found</p>
        <p className="text-gray-500 mb-6">Try adjusting your search, or be the first rater listed in this area.</p>
        <Link href="/get-listed" className="bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors">
          Get Listed Free
        </Link>
      </div>
    )
  }

  return (
    <div>
      <p className="text-gray-500 mb-6">{count} rater{count !== 1 ? 's' : ''} found</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {raters.map((rater: any) => <RaterCard key={rater.id} rater={rater} />)}
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
            const params = new URLSearchParams({ ...searchParams, page: String(p) })
            return (
              <Link key={p} href={`/directory?${params}`}
                className={`px-4 py-2 rounded-lg font-medium ${p === currentPage ? 'bg-blue-700 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-400'}`}>
                {p}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default async function DirectoryPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const resolvedParams = await searchParams
  const counties = [...CA_COUNTIES].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">California Title 24 Rater Directory</h1>
      <p className="text-gray-500 mb-8">Find certified raters across California</p>

      <form method="GET" className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input name="q" defaultValue={resolvedParams.q} placeholder="Name, city, keyword..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
          <select name="type" defaultValue={resolvedParams.type} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
            <option value="">All Types</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">County</label>
          <select name="county" defaultValue={resolvedParams.county ? slugify(resolvedParams.county) : ''} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
            <option value="">All Counties</option>
            {counties.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <div className="flex items-end">
          <button type="submit" className="w-full bg-blue-700 text-white rounded-lg px-4 py-2 font-semibold hover:bg-blue-800 transition-colors">Search</button>
        </div>
      </form>

      <Suspense fallback={<div className="text-center py-10 text-gray-400">Loading raters...</div>}>
        <DirectoryResults searchParams={resolvedParams} />
      </Suspense>
    </div>
  )
}
