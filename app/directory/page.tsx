import { Suspense } from 'react'
import { supabase, type Rater } from '@/lib/supabase'
import RaterCard from '@/components/RaterCard'
import SearchAutocomplete from '@/components/SearchAutocomplete'
import { CATEGORIES, canonicalCategory, categoryMatchValues } from '@/lib/categories'
import { CA_COUNTIES, slugify } from '@/lib/california-data'
import { isZip, countiesForZip } from '@/lib/zip'
import { resolvePlace, suggest, countyList, type PlaceResolution, type Suggestion } from '@/lib/place-match'
import Link from 'next/link'
import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Find a Title 24 Rater in California',
  description: 'Browse California\'s complete directory of HERS raters, ECC raters, commissioning agents, and acceptance testers. Filter by city, county, and service type.',
  // Filter and pagination params all serve the same browsable list — canonical
  // keeps ?type/?county/?page permutations from indexing as duplicates.
  alternates: { canonical: absoluteUrl('/directory') },
}

export const dynamic = 'force-dynamic'

function SuggestionChips({ items }: { items: Suggestion[] }) {
  if (!items.length) return null
  return (
    <div className="mb-7">
      <p className="t-label mb-2.5">Did you mean</p>
      <div className="flex flex-wrap justify-center gap-2">
        {items.map(s => (
          <Link
            key={s.id}
            href={`/directory?q=${encodeURIComponent(s.query)}`}
            className="rounded border border-rule bg-surface px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:border-ink"
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
    <div className="border-t border-ink py-16 text-center">
      <p className="text-xl font-bold text-ink">{title}</p>
      <p className="mx-auto mt-2 mb-7 max-w-[52ch] text-[0.95rem]">{body}</p>
      <SuggestionChips items={suggestions} />
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/directory" className="btn-quiet px-5 py-2.5 text-sm">
          Browse all raters
        </Link>
        <Link href="/get-listed" className="btn-accent px-5 py-2.5 text-sm">
          Get listed free
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
        title={`No results for “${term}”`}
        body="Search by county, city, ZIP code, or company name."
        suggestions={textTerm ? suggest(textTerm, 4) : []}
      />
    )
  }

  return (
    <div>
      {didYouMean && (
        <p className="mb-4 border-l-0 text-sm">
          No company matched <span className="font-medium text-ink">“{term}”</span>. Showing raters for{' '}
          <span className="font-medium text-ink">{didYouMean.label}</span>.
        </p>
      )}
      {descriptionOnly && (
        <p className="mb-4 max-w-[74ch] text-sm">
          <span className="font-medium text-ink">“{term}”</span> isn&rsquo;t a California city or
          county we cover, and no company goes by that name. These are raters who mention it somewhere in their
          listing, not a search by location.
        </p>
      )}

      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-ink pt-3">
        <p className="text-sm">
          <span className="font-bold text-ink">{count}</span>{' '}
          {descriptionOnly ? 'listing' : 'rater'}{count !== 1 ? 's' : ''}{' '}
          {descriptionOnly ? 'mention it' : 'found'}
          {zipScope && ` serving ${countyList(zipScope.counties)} (${zipScope.zip})`}
          {!zipScope && place && ` serving ${place.label}`}
        </p>
        {totalPages > 1 && (
          <p className="t-label">
            Page {currentPage} of {totalPages}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {raters.map((rater: Rater) => <RaterCard key={rater.id} rater={rater} />)}
      </div>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex flex-wrap justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
            const params = new URLSearchParams({ ...searchParams, page: String(p) })
            const current = p === currentPage
            return (
              <Link
                key={p}
                href={`/directory?${params}`}
                aria-current={current ? 'page' : undefined}
                className={`min-w-[2.5rem] rounded px-3 py-2 text-center text-sm font-medium transition-colors ${
                  current
                    ? 'bg-ink text-surface'
                    : 'border border-rule bg-surface text-ink hover:border-ink'
                }`}
              >
                {p}
              </Link>
            )
          })}
        </nav>
      )}
    </div>
  )
}

export default async function DirectoryPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const resolvedParams = await searchParams
  const counties = [...CA_COUNTIES].sort((a, b) => a.name.localeCompare(b.name))

  // The controls are uncontrolled inputs, so they read these once per mount.
  // Keying the form on the active filters remounts it after a client-side
  // navigation — otherwise a shared or bookmarked /directory?type=… showed
  // "All types" over a filtered result set, and paging kept the old box value.
  const activeQ = resolvedParams.q ?? ''
  // ?type=ecc is a live legacy link: the 2025 code renamed HERS to ECC and the
  // category values merged, so resolve it to the option that actually exists.
  const activeType = resolvedParams.type ? canonicalCategory(resolvedParams.type) : ''
  const activeCounty = resolvedParams.county ? slugify(resolvedParams.county) : ''

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
      <h1 className="text-[clamp(1.65rem,3.2vw,2.25rem)] font-bold">
        California Title 24 rater directory
      </h1>
      <p className="mt-2 max-w-[58ch] text-[0.95rem]">
        Certified HERS and ECC raters, commissioning agents, and acceptance testers, filterable by
        place and service.
      </p>

      <form
        key={`${activeQ}|${activeType}|${activeCounty}`}
        method="GET"
        className="mt-8 mb-9 grid grid-cols-1 gap-4 rounded border border-rule bg-surface p-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        <SearchAutocomplete defaultValue={activeQ} />

        <div>
          <label htmlFor="type" className="t-label mb-1.5 block">
            Service type
          </label>
          <select
            id="type"
            name="type"
            defaultValue={activeType}
            className="w-full rounded border border-rule bg-surface px-3 py-2 text-sm text-ink transition-colors focus:border-ink focus:outline-none"
          >
            <option value="">All types</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="county" className="t-label mb-1.5 block">
            County
          </label>
          <select
            id="county"
            name="county"
            defaultValue={activeCounty}
            className="w-full rounded border border-rule bg-surface px-3 py-2 text-sm text-ink transition-colors focus:border-ink focus:outline-none"
          >
            <option value="">All counties</option>
            {counties.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>

        <div className="flex items-end">
          <button type="submit" className="btn-accent w-full px-4 py-2 text-sm">
            Search
          </button>
        </div>
      </form>

      <Suspense
        fallback={
          <div className="border-t border-ink py-14 text-center">
            <p className="t-label">Loading raters</p>
          </div>
        }
      >
        <DirectoryResults searchParams={resolvedParams} />
      </Suspense>
    </div>
  )
}
