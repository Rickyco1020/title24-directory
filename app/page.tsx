import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { CATEGORIES } from '@/lib/categories'
import { CA_COUNTIES, CITIES } from '@/lib/california-data'
import { supabase } from '@/lib/supabase'
import ZoneSheet from '@/components/ZoneSheet'

export const metadata: Metadata = {
  title: 'Title 24 Directory | Find HERS & ECC Raters in California',
  description:
    'Find certified HERS raters, ECC raters, commissioning agents, and acceptance testers across California. Free directory, instant results.',
}

// Real numbers or none. The old hero advertised "4 service types" and
// "100% free" as if they were achievements; the listing count is the only
// figure here a visitor actually cares about, so it comes from the database.
export const revalidate = 3600

const FEATURED_COUNTIES = [
  'los-angeles', 'orange', 'san-diego', 'riverside', 'san-bernardino',
  'santa-clara', 'alameda', 'sacramento', 'fresno', 'kern',
  'ventura', 'contra-costa',
]

const FEATURED_ARTICLES = [
  {
    slug: 'what-is-a-hers-rater',
    title: 'What is a HERS Rater, now called an ECC Rater?',
    excerpt:
      'What the role does, how the 2025 energy code renamed it, and when your permit needs one.',
    meta: 'HERS / ECC · 5 min',
  },
  {
    slug: 'cf2r-vs-cf3r',
    title: 'CF2R vs CF3R: which certificate is which',
    excerpt:
      'Installer certificates versus verifier certificates, and who signs each one.',
    meta: 'Forms · 4 min',
  },
  {
    slug: 'title-24-compliance-guide',
    title: 'California Title 24 compliance: a builder’s guide',
    excerpt:
      'The whole path from CF1R through field verification, in the order it actually happens.',
    meta: 'Compliance · 6 min',
  },
]

async function listingCount(): Promise<number | null> {
  const { count, error } = await supabase
    .from('raters')
    .select('id', { count: 'exact', head: true })
    .in('status', ['approved', 'featured'])
  // A failed count must not render as "0 listings" — that reads as an empty
  // directory when it is actually our outage. Fall back to hiding the cell.
  if (error) return null
  return count ?? null
}

function SearchForm() {
  async function handleSearch(formData: FormData) {
    'use server'
    const q = String(formData.get('q') ?? '').trim()
    redirect(q ? `/directory?q=${encodeURIComponent(q)}` : '/directory')
  }

  return (
    <form action={handleSearch} className="mt-7 flex max-w-lg overflow-hidden rounded border-[1.5px] border-ink bg-surface">
      <label htmlFor="home-q" className="sr-only">
        City, county, or ZIP
      </label>
      <input
        id="home-q"
        type="text"
        name="q"
        placeholder="City, county, or ZIP"
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent px-4 py-3 text-[0.95rem] text-ink placeholder:text-muted focus:outline-none"
      />
      <button type="submit" className="btn-cta shrink-0 rounded-none px-6 py-3 text-sm">
        Search
      </button>
    </form>
  )
}

export default async function HomePage() {
  const count = await listingCount()
  const counties = FEATURED_COUNTIES.map(slug => CA_COUNTIES.find(c => c.slug === slug)).filter(
    (c): c is { name: string; slug: string } => Boolean(c),
  )

  return (
    <>
      <ZoneSheet>
        <h1 className="max-w-[15ch] text-[clamp(1.9rem,4.6vw,3rem)] font-bold leading-[1.04]">
          Every certified rater in California, <span className="marked">before your inspection date</span>.
        </h1>
        <p className="mt-4 max-w-[48ch] text-[0.98rem] leading-relaxed">
          HERS and ECC field verification, mechanical commissioning, and non-residential acceptance
          testing. Searchable by city, county, or ZIP.
        </p>

        <SearchForm />

        <dl className="title-block mt-7">
          {count !== null && (
            <div>
              <dt className="t-label">Listings</dt>
              <dd className="mt-0.5 font-bold text-ink">{count}</dd>
            </div>
          )}
          <div>
            <dt className="t-label">Cities indexed</dt>
            <dd className="mt-0.5 font-bold text-ink">{CITIES.length}</dd>
          </div>
          <div>
            <dt className="t-label">Code cycle</dt>
            <dd className="mt-0.5 font-bold text-ink">2025</dd>
          </div>
        </dl>
      </ZoneSheet>

      {/* ── Services. A ruled index, not three identical cards: the three
             services are not peers you compare, they are three places to
             go, and a list says that faster. ── */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <h2 className="text-[clamp(1.4rem,2.6vw,1.85rem)] font-bold">What are you looking for?</h2>
        <p className="mt-2 max-w-[56ch] text-[0.95rem]">
          Three certifications, three different scopes of work. Pick the one your permit calls for.
        </p>

        <ul className="mt-8 border-t border-ink">
          {CATEGORIES.map(cat => (
            <li key={cat.value} className="border-b border-rule">
              <Link
                href={`/directory?type=${cat.value}`}
                className="group flex flex-wrap items-baseline gap-x-6 gap-y-1.5 py-5 transition-colors hover:bg-sunk sm:flex-nowrap"
              >
                <span className="t-label w-16 shrink-0 pt-1">{cat.code}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-bold text-ink transition-colors group-hover:text-accent">
                    {cat.label}
                  </span>
                  <span className="mt-1 block max-w-[62ch] text-sm">{cat.description}</span>
                </span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-sm font-semibold text-accent transition-transform duration-150 group-hover:translate-x-0.5"
                >
                  Browse →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Browse by county. Replaces the old "How It Works" panel, which
             explained a search box to people who use search boxes. This is
             the thing they'd have used it for. ── */}
      <section className="border-y border-rule bg-sunk">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2 className="text-[clamp(1.4rem,2.6vw,1.85rem)] font-bold">Browse by county</h2>
            <Link
              href="/directory"
              className="text-sm font-semibold text-accent underline decoration-accent-rule underline-offset-4 hover:decoration-accent"
            >
              All 58 counties →
            </Link>
          </div>

          <ul className="cell-grid mt-7 sm:grid-cols-2 lg:grid-cols-4">
            {counties.map(county => (
              <li key={county.slug}>
                <Link
                  href={`/directory/county/${county.slug}`}
                  className="block bg-surface px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-accent-wash hover:text-accent"
                >
                  {county.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Resources ── */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 className="text-[clamp(1.4rem,2.6vw,1.85rem)] font-bold">Title 24, explained</h2>
          <Link
            href="/resources"
            className="text-sm font-semibold text-accent underline decoration-accent-rule underline-offset-4 hover:decoration-accent"
          >
            All resources →
          </Link>
        </div>

        <ul className="mt-7 border-t border-ink">
          {FEATURED_ARTICLES.map(article => (
            <li key={article.slug} className="border-b border-rule">
              <Link
                href={`/resources/${article.slug}`}
                className="group flex flex-wrap items-baseline gap-x-6 gap-y-1.5 py-5 transition-colors hover:bg-sunk sm:flex-nowrap"
              >
                <span className="t-label w-[9.5rem] shrink-0 pt-1">{article.meta}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-lg font-bold text-ink transition-colors group-hover:text-accent">
                    {article.title}
                  </span>
                  <span className="mt-1 block max-w-[62ch] text-sm">{article.excerpt}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Supply-side CTA ── */}
      <section className="bg-accent">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-10 gap-y-6 px-4 py-12 sm:px-6 lg:px-8">
          <div>
            <h2 className="max-w-[20ch] text-[clamp(1.35rem,2.4vw,1.7rem)] font-bold text-white">
              Are you a certified rater?
            </h2>
            <p className="mt-2 max-w-[52ch] text-[0.95rem] text-accent-wash">
              Get listed in the directory GCs search when they need someone before an inspection.
              Free, and it stays free.
            </p>
          </div>
          <Link href="/get-listed" className="btn-cta px-6 py-3.5 text-[0.95rem]">
            Get listed free →
          </Link>
        </div>
      </section>
    </>
  )
}
