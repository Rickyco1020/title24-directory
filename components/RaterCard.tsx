import Link from 'next/link'
import { BADGE_COLORS, CATEGORY_LABELS } from '@/lib/categories'
import { CA_COUNTIES } from '@/lib/california-data'
import type { Rater } from '@/lib/supabase'

function formatCounty(slug: string): string {
  return CA_COUNTIES.find(c => c.slug === slug)?.name ?? slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export default function RaterCard({ rater }: { rater: Rater }) {
  return (
    <div className={`bg-white rounded-2xl border p-6 ${rater.status === 'featured' ? 'border-yellow-400 shadow-md' : 'border-gray-200'}`}>
      {rater.status === 'featured' && (
        <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded mb-3">⭐ Featured</span>
      )}
      <h3 className="font-bold text-gray-900 text-xl mb-2">{rater.business_name}</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        {rater.services.map(s => (
          <span key={s} className={`text-xs font-semibold px-2 py-1 rounded ${BADGE_COLORS[s] ?? 'bg-gray-100 text-gray-700'}`}>
            {CATEGORY_LABELS[s] ?? s}
          </span>
        ))}
      </div>
      {(rater.cities_served?.length || rater.counties_served?.length) && (
        <p className="text-gray-500 text-sm mb-3">
          📍 {[...(rater.counties_served ?? []).map(formatCounty), ...(rater.cities_served ?? [])].slice(0, 3).join(', ')}
          {(rater.cities_served?.length ?? 0) + (rater.counties_served?.length ?? 0) > 3 ? ' +more' : ''}
        </p>
      )}
      {rater.description && <p className="text-gray-600 text-sm mb-4 line-clamp-2">{rater.description}</p>}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
        <div className="flex flex-wrap gap-3">
          {rater.phone && (
            <a href={`tel:${rater.phone}`} className="text-blue-700 font-medium text-sm hover:underline">📞 {rater.phone}</a>
          )}
          {rater.website && (
            <a href={rater.website} target="_blank" rel="noopener noreferrer" className="text-blue-700 font-medium text-sm hover:underline">🌐 Website</a>
          )}
        </div>
        <Link
          href={`/directory/rater/${rater.id}`}
          className="text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline whitespace-nowrap"
        >
          View Profile →
        </Link>
      </div>
    </div>
  )
}
