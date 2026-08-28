import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { CATEGORY_LABELS, displayServices } from '@/lib/categories'
import type { Rater } from '@/lib/supabase'
import { CA_COUNTIES, cityName } from '@/lib/california-data'
import { escapeForJsonLd, safeExternalUrl } from '@/lib/security'
import Breadcrumb from '@/components/Breadcrumb'
import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/site'

function formatCountyName(slug: string): string {
  const county = CA_COUNTIES.find(c => c.slug === slug)
  return county?.name ?? slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export const dynamic = 'force-dynamic'

async function getRater(id: string): Promise<Rater | null> {
  const { data } = await supabase
    .from('raters')
    .select('*')
    .eq('id', id)
    .in('status', ['approved', 'featured'])
    .single()
  return data
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const rater = await getRater(id)
  if (!rater) return {}
  const counties = rater.counties_served?.slice(0, 2).map(formatCountyName).join(', ') ?? 'California'
  return {
    // `absolute` opts out of the layout's '%s | Title 24 Directory' template:
    // with it, a long business name pushed these past 90 characters and Google
    // truncated the part that identifies the company.
    title: { absolute: `${rater.business_name} | Title 24 Rater` },
    description: rater.description ?? `${rater.business_name} is a certified Title 24 rater serving ${counties}. View services, coverage area, and contact details.`,
    alternates: { canonical: absoluteUrl(`/directory/rater/${id}`) },
  }
}

export default async function RaterProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const rater = await getRater(id)
  if (!rater) notFound()

  const counties = rater.counties_served ?? []
  const cities = rater.cities_served ?? []
  const services = displayServices(rater.services)
  // Only ever emit http(s) links — a stored `javascript:` value must not become an href.
  const website = safeExternalUrl(rater.website)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: rater.business_name,
    description: rater.description ?? undefined,
    telephone: rater.phone ?? undefined,
    url: website ?? undefined,
    areaServed: counties.map(c => ({ '@type': 'AdministrativeArea', name: formatCountyName(c) })),
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: escapeForJsonLd(jsonLd) }} />

      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Directory', href: '/directory' },
        { label: rater.business_name },
      ]} />

      {/* ── Sheet head ── */}
      <header className="border-t border-ink pt-6">
        {rater.status === 'featured' && <p className="t-label mb-2 text-ink">Featured listing</p>}

        <div className="flex flex-col gap-y-5 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-x-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-[clamp(1.7rem,3.4vw,2.4rem)] font-bold leading-[1.06]">
              {rater.business_name}
            </h1>
            {services.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {services.map(s => (
                  <span key={s} className="tag">{CATEGORY_LABELS[s] ?? s}</span>
                ))}
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap gap-2.5">
            {rater.phone && (
              <a href={`tel:${rater.phone}`} className="btn-accent px-5 py-3 text-[0.95rem]">
                {rater.phone}
              </a>
            )}
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-quiet px-5 py-3 text-[0.95rem]"
              >
                Visit website
              </a>
            )}
          </div>
        </div>

        {rater.description && (
          <p className="mt-6 max-w-[68ch] border-t border-rule pt-6 leading-relaxed">
            {rater.description}
          </p>
        )}
      </header>

      {/* ── Title block: everything factual, in labelled cells ── */}
      <dl className="cell-grid mt-8 sm:grid-cols-2 lg:grid-cols-4">
        {rater.contact_name && (
          <div className="bg-surface px-4 py-3.5">
            <dt className="t-label">Contact</dt>
            <dd className="mt-1 text-sm text-ink">{rater.contact_name}</dd>
          </div>
        )}
        {rater.license_number && (
          <div className="bg-surface px-4 py-3.5">
            <dt className="t-label">Certification</dt>
            <dd className="mt-1 font-mono text-sm text-ink">{rater.license_number}</dd>
          </div>
        )}
        {rater.phone && (
          <div className="bg-surface px-4 py-3.5">
            <dt className="t-label">Phone</dt>
            <dd className="mt-1 text-sm">
              <a href={`tel:${rater.phone}`} className="text-accent underline decoration-accent-rule underline-offset-2 hover:decoration-accent">
                {rater.phone}
              </a>
            </dd>
          </div>
        )}
        {/* Guarded like phone and website above. Unguarded, a seeded listing
            with no email rendered an empty link to mailto:null. */}
        {rater.email && (
          <div className="bg-surface px-4 py-3.5">
            <dt className="t-label">Email</dt>
            <dd className="mt-1 break-all text-sm">
              <a href={`mailto:${rater.email}`} className="text-accent underline decoration-accent-rule underline-offset-2 hover:decoration-accent">
                {rater.email}
              </a>
            </dd>
          </div>
        )}
        {website && (
          <div className="bg-surface px-4 py-3.5">
            <dt className="t-label">Website</dt>
            <dd className="mt-1 break-all text-sm">
              <a href={website} target="_blank" rel="noopener noreferrer" className="text-accent underline decoration-accent-rule underline-offset-2 hover:decoration-accent">
                {website.replace(/^https?:\/\//, '')}
              </a>
            </dd>
          </div>
        )}
      </dl>

      {/* Same escape hatch the directory cards carry — a seeded business landing
          on its own profile needs a path to claim or remove it. */}
      {rater.source === 'seeded' && (
        <p className="mt-4 text-xs text-muted">
          Compiled from public business information.{' '}
          <Link href={`/claim?listing=${rater.id}`} className="underline underline-offset-2 hover:text-ink">
            Claim or remove this listing
          </Link>
        </p>
      )}

      {/* ── Coverage ── */}
      {(counties.length > 0 || cities.length > 0) && (
        <section className="mt-12">
          <h2 className="text-lg font-bold">Service area</h2>

          {counties.length > 0 && (
            <div className="mt-5">
              <p className="t-label mb-2.5">Counties</p>
              <div className="flex flex-wrap gap-2">
                {counties.map(c => (
                  <Link
                    key={c}
                    href={`/directory/county/${c}`}
                    className="rounded border border-rule bg-surface px-3 py-1.5 text-sm text-ink transition-colors hover:border-ink"
                  >
                    {formatCountyName(c)}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {cities.length > 0 && (
            <div className="mt-6">
              <p className="t-label mb-2.5">Cities</p>
              {/* Stored as slugs. Printing the array raw rendered
                  "irvine, rancho-cucamonga" at visitors, right under a Counties
                  block that was correctly formatted. */}
              <div className="flex flex-wrap gap-2">
                {cities.map(c => (
                  <Link
                    key={c}
                    href={`/directory/${c}`}
                    className="rounded border border-rule bg-surface px-3 py-1.5 text-sm text-ink transition-colors hover:border-ink"
                  >
                    {cityName(c)}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <div className="mt-14 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-rule pt-5">
        <Link
          href="/directory"
          className="text-sm font-semibold text-accent underline decoration-accent-rule underline-offset-4 hover:decoration-accent"
        >
          ← Back to directory
        </Link>
        <p className="text-xs text-muted">
          <Link href="/get-listed" className="underline underline-offset-2 hover:text-ink">
            Get your business listed free
          </Link>
        </p>
      </div>
    </div>
  )
}
