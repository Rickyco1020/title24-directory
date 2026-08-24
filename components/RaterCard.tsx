import { BADGE_COLORS, CATEGORY_LABELS, displayServices } from '@/lib/categories'
import { safeExternalUrl } from '@/lib/security'
import type { Rater } from '@/lib/supabase'
import { countyName, cityName } from '@/lib/california-data'

export default function RaterCard({ rater }: { rater: Rater }) {
  return (
    <div className={`bg-white rounded-2xl border p-6 flex flex-col ${rater.status === 'featured' ? 'border-yellow-400 shadow-md ring-1 ring-yellow-200' : 'border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          {rater.status === 'featured' && (
            <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded mb-2">Featured</span>
          )}
          <h3 className="font-bold text-gray-900 text-xl">{rater.business_name}</h3>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {displayServices(rater.services).map(s => (
          <span key={s} className={`text-xs font-semibold px-2 py-1 rounded ${BADGE_COLORS[s] ?? 'bg-gray-100 text-gray-700'}`}>
            {CATEGORY_LABELS[s] ?? s}
          </span>
        ))}
      </div>

      {((rater.cities_served?.length ?? 0) + (rater.counties_served?.length ?? 0)) > 0 && (
        <p className="flex items-start text-gray-500 text-sm mb-2">
          <svg className="w-4 h-4 mr-1.5 mt-0.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          <span>
            {[
              ...(rater.counties_served ?? []).map(c => `${countyName(c)} County`),
              ...(rater.cities_served ?? []).map(cityName),
            ].slice(0, 4).join(', ')}
            {(rater.cities_served?.length ?? 0) + (rater.counties_served?.length ?? 0) > 4 ? ' +more' : ''}
          </span>
        </p>
      )}

      {rater.license_number && (
        <p className="text-gray-400 text-xs mb-2">License #{rater.license_number}</p>
      )}

      {rater.description && (
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{rater.description}</p>
      )}

      <div className="border-t border-gray-100 pt-4 mt-auto flex flex-wrap gap-x-4 gap-y-2">
        {rater.phone && (
          <a href={`tel:${rater.phone}`} className="inline-flex items-center text-blue-700 font-medium text-sm hover:underline">
            <svg className="w-4 h-4 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            {rater.phone}
          </a>
        )}
        {rater.email && (
          <a href={`mailto:${rater.email}`} className="inline-flex items-center text-blue-700 font-medium text-sm hover:underline">
            <svg className="w-4 h-4 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            Email
          </a>
        )}
        {safeExternalUrl(rater.website) && (
          <a href={safeExternalUrl(rater.website)!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-700 font-medium text-sm hover:underline">
            <svg className="w-4 h-4 mr-1.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
            Website
          </a>
        )}
      </div>

      {rater.source === 'seeded' && (
        <p className="mt-3 text-xs text-gray-400">
          Compiled from public business information.{' '}
          <a href={`/claim?listing=${rater.id}`} className="underline hover:text-gray-600">
            Claim or remove this listing
          </a>
        </p>
      )}
    </div>
  )
}
