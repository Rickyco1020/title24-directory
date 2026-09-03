import Link from 'next/link'
import { CATEGORY_LABELS, displayServices } from '@/lib/categories'
import { safeExternalUrl } from '@/lib/security'
import { formatPhone, telHref } from '@/lib/format'
import type { Rater } from '@/lib/supabase'
import { countyName, cityName } from '@/lib/california-data'

/**
 * A listing, drawn like a sheet: name and services in the head, everything
 * factual in labelled title-block cells underneath.
 *
 * The phone number is the loudest element on purpose. It is the thing a GC
 * came here for, and the old card buried it in a row of four identical
 * blue links.
 */
export default function RaterCard({ rater }: { rater: Rater }) {
  const services = displayServices(rater.services)
  const website = safeExternalUrl(rater.website)
  const featured = rater.status === 'featured'

  const coverage = [
    ...(rater.counties_served ?? []).map(c => `${countyName(c)} County`),
    ...(rater.cities_served ?? []).map(cityName),
  ]
  const shownCoverage = coverage.slice(0, 4).join(', ')
  const extraCoverage = coverage.length > 4 ? ` +${coverage.length - 4} more` : ''

  return (
    <article
      className={`flex flex-col overflow-hidden rounded bg-surface transition-colors duration-150 ${
        featured ? 'border border-ink' : 'border border-rule hover:border-ink'
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 px-4 pb-3 pt-4">
        <div className="min-w-0 flex-1">
          {featured && <p className="t-label mb-1.5 text-ink">Featured listing</p>}
          <h3 className="text-lg font-bold leading-tight">
            <Link
              href={`/directory/rater/${rater.id}`}
              className="text-ink transition-colors hover:text-accent"
            >
              {rater.business_name}
            </Link>
          </h3>
          {services.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {services.map(s => (
                <span key={s} className="tag">
                  {CATEGORY_LABELS[s] ?? s}
                </span>
              ))}
            </div>
          )}
        </div>

        {rater.phone && (
          <a href={telHref(rater.phone)} className="btn-ink shrink-0 px-3.5 py-2 text-sm">
            {formatPhone(rater.phone)}
          </a>
        )}
      </div>

      {rater.description && (
        <p className="desc-fade line-clamp-2 px-4 pb-3 text-sm leading-relaxed">
          {rater.description}
        </p>
      )}

      <dl className="mt-auto flex flex-wrap border-t border-rule">
        {coverage.length > 0 && (
          <div className="min-w-[11rem] flex-1 border-r border-rule px-4 py-2.5 last:border-r-0">
            <dt className="t-label">Serves</dt>
            <dd className="mt-0.5 text-sm">
              {shownCoverage}
              {extraCoverage}
            </dd>
          </div>
        )}
        {rater.license_number && (
          <div className="min-w-[11rem] flex-1 border-r border-rule px-4 py-2.5 last:border-r-0">
            <dt className="t-label">Certification</dt>
            <dd className="mt-0.5 font-mono text-sm">{rater.license_number}</dd>
          </div>
        )}
        {(website || rater.email) && (
          <div className="min-w-[11rem] flex-1 border-r border-rule px-4 py-2.5 last:border-r-0">
            <dt className="t-label">Also</dt>
            <dd className="mt-0.5 flex flex-wrap gap-x-3 text-sm">
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline decoration-accent-rule underline-offset-2 hover:decoration-accent"
                >
                  Website
                </a>
              )}
              {rater.email && (
                <a
                  href={`mailto:${rater.email}`}
                  className="text-accent underline decoration-accent-rule underline-offset-2 hover:decoration-accent"
                >
                  Email
                </a>
              )}
            </dd>
          </div>
        )}
      </dl>

      {rater.source === 'seeded' && (
        <p className="border-t border-rule-soft bg-sunk px-4 py-2 text-xs text-muted">
          Compiled from public business information.{' '}
          <Link href={`/claim?listing=${rater.id}`} className="underline underline-offset-2 hover:text-ink">
            Claim or remove this listing
          </Link>
        </p>
      )}
    </article>
  )
}
