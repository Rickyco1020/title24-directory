import { Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import RaterCard from '@/components/RaterCard'
import SearchAutocomplete from '@/components/SearchAutocomplete'
import { CATEGORIES, categoryMatchValues } from '@/lib/categories'
import { CA_COUNTIES, slugify } from '@/lib/california-data'
import { isZip, countiesForZip } from '@/lib/zip'
import { resolvePlace, suggest, countyList, type PlaceResolution, type Suggestion } from '@/lib/place-match'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find a Title 24 Rater | California HERS & ECC Directory',
  description: 'Browse California\'s complete directory of HERS raters, ECC raters, commissioning agents, and acceptance testers. Filter by city, county, and service type.',
}

export const dynamic = 'force-dynamic'

function SuggestionChips({ items }: { items: Suggestion[] }) {
  if (!items.length) return null
  return (
    <div className="mb-6">
      <p className="text-sm text-gray-500 mb-3">Did you mean:</p>
      <div className="flex flex-wrap justify-center gap-2">
        {items.map(s => (
          <Link
            key={s.id}
            href={`/directory?q=${encodeURIComponent(s.query)}`}
            className="bg-blue-50 text-blue-700 border border-blue-100 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
          >
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

function NoResults({ title, body, suggestions = [] }: { title: string; body: string; suggestions?: Suggestion[] }) {
  return (
    <div className="text-center py-16">
      <p className="text-2xl font-bold text-gray-700 mb-2">{title}</p>
      <p className="text-gray-500 mb-6">{body}</p>
      <SuggestionChips items={suggestions} />
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/directory" className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:border-blue-400 transition-colors">
          Browse all raters
        </Link>
        <Link href="/get-listed" className="bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors">
          Get Listed Free
        </Link>
      </div>
    </div>
  )
}

type QueryOpts = {
  type?: string
  county?: string
  place?: PlaceResolution | null
  zipCounties?: string[] | null
  text?: string | null
  /** Which columns a free-text term is allowed to hit. */
  textFields?: 'name' | 'name+description'
  from: number
  to: number
}

function runQuery(opts: QueryOpts) {
  let query = supabase
    .from('raters')
    .select('*', { count: 'exact' })
    .in('status', ['approved', 'featured'])
    // status first, then a stable tiebreaker: without a unique second key
    // Postgres may order ties differently between range() calls, so a rater
    // could appear on two pages or on none.
    .order('status', { ascending: false })
    .order('id', { ascending: true })
    .range(opts.from, opts.to)

  if (opts.type) query = query.overlaps('services', categoryMatchValues(opts.type))

  // counties_served stores slugs ('los-angeles'). slugify() is idempotent, so this
  // accepts both the slug the form now submits and the display name older links carry.
  if (opts.county) query = query.contains('counties_served', [slugify(opts.county)])

  // overlaps() rather than contains() throughout: a region alias ('Inland Empire')
  // and a straddling ZIP prefix both resolve to more than one county.
  if (opts.place?.kind === 'county') query = query.overlaps('counties_served', opts.place.countySlugs)
  // A rater covering all of Riverside County does serve Jurupa Valley, so a
  // city search has to include county-wide coverage — otherwise searching a
  // city returns 'none yet' while that city's own page lists seventeen.
  if (opts.place?.kind === 'city') {
    query = query.or(
      `cities_served.cs.{${opts.place.citySlug}},counties_served.cs.{${opts.place.countySlug}}`,
    )
  }
  if (opts.zipCounties?.length) query = query.overlaps('counties_served', opts.zipCounties)

  if (opts.text) {
    // or() takes a raw filter string; strip what would break out of it.
    // '%' is stripped too — it would turn ilike.*term* into match-everything.
    const safe = opts.text.replace(/[(),*%\\]/g, ' ').trim()
    if (safe) {
      // Business name only, by default. Matching description text turned every
      // unrecognised place name into an authoritative-looking result set:
      // 'Santa Clarita' returned 21 raters, not one of which was a Santa Clarita
      // result — they were listings whose blurb happened to contain the words,
      // presented under a plain "21 raters found". Description is still
      // searchable, but only as a labelled last resort, never as a place answer.
      query = opts.textFields === 'name+description'
        ? query.or(`business_name.ilike.*${safe}*,description.ilike.*${safe}*`)
        : query.ilike('business_name', `*${safe}*`)
    }
  }

  return query
}

async function DirectoryResults({ searchParams }: { searchParams: Record<string, string> }) {
  const { q, type, county, page } = searchParams
  // ?page=abc would become range(NaN, NaN) and ?page=0 range(-20, -1);
  // both are PostgREST errors that would render as an innocuous empty state.
  const currentPage = Math.max(1, parseInt(page ?? '1', 10) || 1)
  const perPage = 20
  const from = (currentPage - 1) * perPage
  const to = from + perPage - 1

  const term = q?.trim() ?? ''

  let place: PlaceResolution | null = null
  let zipScope: { zip: string; counties: string[] } | null = null
  let unplaceableZip: string | null = null
  let textTerm: string | null = null

  if (term) {
    if (isZip(term)) {
      // No rater row stores a ZIP, so match on the county the ZIP sits in.
      const zipCounties = countiesForZip(term)
      if (zipCounties.length) zipScope = { zip: term, counties: zipCounties }
      else unplaceableZip = term
    } else {
      // Aliases, trailing 'County', accents and 'City of' are all handled here,
      // so 'la county', 'Los Angeles County', 'LA' and 'the OC' all land.
      place = resolvePlace(term)
      if (!place) textTerm = term
    }
  }

  // A ZIP we can't place is not a match for all 52 listings — say so rather
  // than handing back the unfiltered directory as if it answered the question.
  if (unplaceableZip) {
    return (
      <NoResults
        title={`${unplaceableZip} isn't a California ZIP code`}
        body="This directory covers California only."
      />
    )
  }

  const first = await runQuery({
    type, county, place, zipCounties: zipScope?.counties, text: textTerm, from, to,
  })
  let { data: raters, count } = first
  // A failed query returns data:null, which is indistinguishable from an honest
  // "nobody matches" unless we look. An empty state is a claim about the data
  // and must not be used to report our own outage.
  let queryFailed = Boolean(first.error)
  if (first.error) console.error('directory search failed', { term, type, county }, first.error)

  // A free-text term that matched no business name may still have been a place,
  // just misspelled or abbreviated. Only retry once the literal search has come
  // back empty, so a real company name is never hijacked by a nearby city.
  let didYouMean: Suggestion | null = null
  if (!raters?.length && textTerm) {
    const candidate = suggest(textTerm, 1)[0]
    const candidatePlace = candidate ? resolvePlace(candidate.query) : null
    if (candidate && candidatePlace) {
      const retry = await runQuery({
        type, county, place: candidatePlace, text: null, from, to,
      })
      if (retry.error) console.error('directory did-you-mean retry failed', retry.error)
      if (retry.data?.length) {
        queryFailed = false
        raters = retry.data
        count = retry.count
        place = candidatePlace
        didYouMean = candidate
        textTerm = null
      }
    }
  }

  // Last resort: the words appear in someone's blurb. That is a real thing to
  // offer, but it is not an answer to "who works in X" — so it runs only after
  // both the name search and the place retry have failed, and it says what it is.
  let descriptionOnly = false
  if (!raters?.length && textTerm) {
    const loose = await runQuery({
      type, county, text: textTerm, textFields: 'name+description', from, to,
    })
    if (loose.error) console.error('directory description fallback failed', loose.error)
    if (loose.data?.length) {
      queryFailed = false
      raters = loose.data
      count = loose.count
      descriptionOnly = true
    }
  }

  const totalPages = Math.ceil((count ?? 0) / perPage)

  if (queryFailed) {
    return (
      <NoResults
        title="We couldn't run that search just now"
        body="This is a problem on our end, not an empty directory. Please try again in a moment."
      />
    )
  }

  if (!raters?.length) {
    if (zipScope) {
      return (
        <NoResults
          title={`No raters serving ${countyList(zipScope.counties)} yet`}
          body={`${zipScope.zip} is in ${countyList(zipScope.counties)}. Browse every California rater, or be the first listed in this area.`}
        />
      )
    }
    if (place) {
      return (
        <NoResults
          title={`No raters serving ${place.label} yet`}
          body="Browse every California rater, or be the first listed in this area."
        />
      )
    }
    return (
      <NoResults
        title={`No results for "${term}"`}
        body="Search by county, city, ZIP code, or company name."
        suggestions={textTerm ? suggest(textTerm, 4) : []}
      />
    )
  }

  return (
    <div>
      {didYouMean && (
        <p className="text-sm text-gray-600 mb-4">
          No company matched <span className="font-medium">&ldquo;{term}&rdquo;</span>. Showing raters for{' '}
          <span className="font-medium text-gray-900">{didYouMean.label}</span>.
        </p>
      )}
      {descriptionOnly && (
        <p className="text-sm text-gray-600 mb-4">
          <span className="font-medium text-gray-900">&ldquo;{term}&rdquo;</span> isn&rsquo;t a California city or
          county we cover, and no company goes by that name. These are raters who mention it somewhere in their
          listing &mdash; not a search by location.
        </p>
      )}
      <p className="text-gray-500 mb-6">
        {count} {descriptionOnly ? 'listing' : 'rater'}{count !== 1 ? 's' : ''} {descriptionOnly ? 'mention it' : 'found'}
        {zipScope && ` serving ${countyList(zipScope.counties)} (${zipScope.zip})`}
        {!zipScope && place && ` serving ${place.label}`}
      </p>
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
        <SearchAutocomplete defaultValue={resolvedParams.q} />
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
