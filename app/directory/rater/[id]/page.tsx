import { notFound } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { BADGE_COLORS, CATEGORY_LABELS, displayServices } from '@/lib/categories'
import type { Rater } from '@/lib/supabase'
import { CA_COUNTIES, cityName } from '@/lib/california-data'
import { escapeForJsonLd, safeExternalUrl } from '@/lib/security'
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
    title: `${rater.business_name} | Title 24 Rater — ${counties}`,
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: escapeForJsonLd(jsonLd) }} />

      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-700">Home</Link>
        <span>›</span>
        <Link href="/directory" className="hover:text-blue-700">Directory</Link>
        <span>›</span>
        <span className="text-gray-900 font-medium">{rater.business_name}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            {rater.status === 'featured' && (
              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded mb-3">⭐ Featured</span>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{rater.business_name}</h1>
            <div className="flex flex-wrap gap-2">
              {displayServices(rater.services).map(s => (
                <span key={s} className={`text-sm font-semibold px-3 py-1 rounded-full ${BADGE_COLORS[s] ?? 'bg-gray-100 text-gray-700'}`}>
                  {CATEGORY_LABELS[s] ?? s}
                </span>
              ))}
            </div>
          </div>

          {/* Contact CTA */}
          <div className="flex flex-col gap-2 shrink-0">
            {rater.phone && (
              <a
                href={`tel:${rater.phone}`}
                className="flex items-center justify-center gap-2 bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold hover:bg-blue-800 transition-colors"
              >
                <span>📞</span> {rater.phone}
              </a>
            )}
            {website && (
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-blue-700 px-5 py-3 rounded-xl font-semibold hover:border-blue-400 transition-colors"
              >
                <span>🌐</span> Visit Website
              </a>
            )}
          </div>
        </div>

        {rater.description && (
          <p className="text-gray-600 text-base leading-relaxed border-t border-gray-100 pt-6">{rater.description}</p>
        )}
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Services */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Services Offered</h2>
          <ul className="space-y-2">
            {displayServices(rater.services).map(s => (
              <li key={s} className="flex items-center gap-2 text-gray-700">
                <span className="text-green-500 font-bold">✓</span>
                {CATEGORY_LABELS[s] ?? s}
              </li>
            ))}
          </ul>
        </div>

        {/* Coverage */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Service Area</h2>
          {counties.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Counties</p>
              <div className="flex flex-wrap gap-2">
                {counties.map(c => (
                  <Link
                    key={c}
                    href={`/directory/county/${c}`}
                    className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full hover:bg-blue-100 hover:text-blue-800 transition-colors"
                  >
                    {formatCountyName(c)}
                  </Link>
                ))}
              </div>
            </div>
          )}
          {cities.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Cities</p>
              {/* Stored as slugs. Printing the array raw rendered
                  "irvine, rancho-cucamonga" at visitors, right under a Counties
                  block that was correctly formatted. */}
              <div className="flex flex-wrap gap-2">
                {cities.map(c => (
                  <Link
                    key={c}
                    href={`/directory/${c}`}
                    className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full hover:bg-blue-100 hover:text-blue-800 transition-colors"
                  >
                    {cityName(c)}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Credentials */}
        {(rater.license_number || rater.contact_name) && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Credentials</h2>
            <dl className="space-y-3">
              {rater.contact_name && (
                <div>
                  <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Contact</dt>
                  <dd className="text-gray-700 mt-0.5">{rater.contact_name}</dd>
                </div>
              )}
              {rater.license_number && (
                <div>
                  <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wide">License / Certification</dt>
                  <dd className="text-gray-700 mt-0.5 font-mono">{rater.license_number}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* Contact info */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Contact</h2>
          <dl className="space-y-3">
            {rater.phone && (
              <div>
                <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Phone</dt>
                <dd className="mt-0.5">
                  <a href={`tel:${rater.phone}`} className="text-blue-700 hover:underline">{rater.phone}</a>
                </dd>
              </div>
            )}
            {website && (
              <div>
                <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Website</dt>
                <dd className="mt-0.5">
                  <a href={website} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline break-all">{website}</a>
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Email</dt>
              <dd className="mt-0.5">
                <a href={`mailto:${rater.email}`} className="text-blue-700 hover:underline">{rater.email}</a>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Back to directory */}
      <div className="flex items-center justify-between">
        <Link href="/directory" className="text-blue-700 font-semibold hover:underline">
          ← Back to Directory
        </Link>
        <p className="text-xs text-gray-400">
          Listed on Title 24 Directory · <Link href="/get-listed" className="hover:text-blue-700">Get your business listed free →</Link>
        </p>
      </div>
    </div>
  )
}
