import { redirect } from 'next/navigation'
import { createServiceClient, type ListingRequest, type Rater } from '@/lib/supabase'
import { updateRaterStatus, adminLogout, isAuthenticated } from './actions'
import { safeExternalUrl } from '@/lib/security'
import type { Metadata } from 'next'
import { cityName, countyName } from '@/lib/california-data'

export const metadata: Metadata = { title: 'Admin' }
export const dynamic = 'force-dynamic'


function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    featured: 'bg-blue-100 text-blue-800',
  }
  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${colors[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}

function VerificationBadge({ status, sentTo }: { status?: string; sentTo?: string | null }) {
  const map: Record<string, { label: string; cls: string; title: string }> = {
    verified: {
      label: 'CONFIRMED',
      cls: 'bg-green-200 text-green-900',
      title: 'The address on file for this listing confirmed the removal.',
    },
    pending: {
      label: 'AWAITING CONFIRMATION',
      cls: 'bg-yellow-200 text-yellow-900',
      title: `Confirmation email sent to ${sentTo ?? 'the address on file'} — not yet confirmed.`,
    },
    unverifiable: {
      label: 'UNVERIFIED',
      cls: 'bg-gray-200 text-gray-800',
      title: 'No listing on file to confirm against. Verify by hand before actioning.',
    },
  }
  const badge = map[status ?? ''] ?? map.unverifiable
  return (
    <span title={badge.title} className={`inline-block px-2 py-0.5 rounded text-xs font-bold mr-2 ${badge.cls}`}>
      {badge.label}
    </span>
  )
}

async function approveRater(id: string) {
  'use server'
  await updateRaterStatus(id, 'approved')
}

async function featureRater(id: string) {
  'use server'
  await updateRaterStatus(id, 'featured')
}

async function rejectRater(id: string) {
  'use server'
  await updateRaterStatus(id, 'rejected')
}

export default async function AdminPage() {
  if (!(await isAuthenticated())) redirect('/admin/login')

  const supabase = createServiceClient()
  const { data: pending } = await supabase
    .from('raters')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  const { data: approved } = await supabase
    .from('raters')
    .select('*')
    .in('status', ['approved', 'featured'])
    .order('created_at', { ascending: false })

  const { data: requests } = await supabase
    .from('listing_requests')
    .select('*')
    .eq('handled', false)
    .order('created_at', { ascending: true })

  const pendingCount = pending?.length ?? 0
  const approvedCount = approved?.length ?? 0
  const requestCount = requests?.length ?? 0

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Manage rater listings</p>
        </div>
        <form action={adminLogout}>
          <button type="submit" className="text-sm text-gray-500 hover:text-accent-600 font-medium border border-gray-200 rounded-lg px-4 py-2 hover:border-accent-300 transition-colors">
            Log Out
          </button>
        </form>
      </div>

      {requestCount > 0 && (
        <div className="bg-orange-50 border border-orange-300 rounded-xl p-5 mb-8">
          <h2 className="font-bold text-orange-900 mb-3">
            {requestCount} open listing {requestCount === 1 ? 'request' : 'requests'}
          </h2>
          <ul className="space-y-3">
            {requests!.map((r: ListingRequest) => (
              <li key={r.id} className="text-sm text-orange-900">
                <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold mr-2 ${
                  r.kind === 'remove' ? 'bg-accent-200 text-accent-900' : 'bg-orange-200 text-orange-900'}`}>
                  {r.kind.toUpperCase()}
                </span>
                {r.kind === 'remove' && <VerificationBadge status={r.verification_status} sentTo={r.verify_sent_to} />}
                <strong>{r.business_name || '(no business given)'}</strong>
                {' — '}{r.contact_name}{' · '}
                <a href={`mailto:${r.email}`} className="underline">{r.email}</a>
                {r.phone ? ` · ${r.phone}` : ''}
                {r.message ? <span className="block text-orange-800 mt-1 pl-1">{r.message}</span> : null}
              </li>
            ))}
          </ul>
          <p className="text-xs text-orange-700 mt-3">
            Only action a removal once it shows <strong>CONFIRMED</strong> — anyone can file one, and
            the listing&apos;s id is printed on its own public card. Unconfirmed ones are waiting on
            the address already on file for the listing; check by hand before acting on any marked
            unverified. Mark handled in the database once done.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <p className="text-sm text-yellow-700 font-medium">Pending Review</p>
          <p className="text-4xl font-bold text-yellow-800 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <p className="text-sm text-green-700 font-medium">Live Listings</p>
          <p className="text-4xl font-bold text-green-800 mt-1">{approvedCount}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 col-span-2 sm:col-span-1">
          <p className="text-sm text-blue-700 font-medium">Total</p>
          <p className="text-4xl font-bold text-blue-800 mt-1">{pendingCount + approvedCount}</p>
        </div>
      </div>

      {/* Pending Section */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-yellow-400 rounded-full inline-block"></span>
          Pending Review
          {pendingCount > 0 && (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">{pendingCount}</span>
          )}
        </h2>

        {pendingCount === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500">
            No pending submissions — you&apos;re all caught up! 🎉
          </div>
        ) : (
          <div className="space-y-4">
            {pending!.map((rater: Rater) => (
              <div key={rater.id} className="bg-white border-2 border-yellow-200 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 truncate">{rater.business_name}</h3>
                      <StatusBadge status={rater.status} />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{rater.contact_name} · <a href={`mailto:${rater.email}`} className="text-blue-600 hover:underline">{rater.email}</a>{rater.phone ? ` · ${rater.phone}` : ''}</p>
                    {safeExternalUrl(rater.website) && (
                      <p className="text-sm text-blue-600 hover:underline mb-1">
                        <a href={safeExternalUrl(rater.website)!} target="_blank" rel="noopener noreferrer">
                          {safeExternalUrl(rater.website)}
                        </a>
                      </p>
                    )}
                    {rater.website && !safeExternalUrl(rater.website) && (
                      <p className="text-sm text-accent-600 mb-1" title="Not an http(s) URL — shown as plain text, not linked">
                        ⚠ Unsafe website value: <span className="font-mono">{rater.website}</span>
                      </p>
                    )}
                    {rater.license_number && <p className="text-sm text-gray-500 mb-2">License: {rater.license_number}</p>}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {rater.services?.map((s: string) => (
                        <span key={s} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      <strong>Counties:</strong> {rater.counties_served?.map(countyName).join(', ') || '—'}
                    </p>
                    {rater.cities_served && rater.cities_served.length > 0 && (
                      <p className="text-xs text-gray-500 mb-1">
                        <strong>Cities:</strong> {rater.cities_served.map(cityName).join(', ')}
                      </p>
                    )}
                    {rater.description && (
                      <p className="text-sm text-gray-600 mt-2 italic">&ldquo;{rater.description}&rdquo;</p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">Submitted: {new Date(rater.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <form action={approveRater.bind(null, rater.id)}>
                      <button type="submit" className="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors">
                        ✓ Approve
                      </button>
                    </form>
                    <form action={featureRater.bind(null, rater.id)}>
                      <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
                        ⭐ Feature
                      </button>
                    </form>
                    <form action={rejectRater.bind(null, rater.id)}>
                      <button type="submit" className="w-full bg-accent-100 text-accent-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent-200 transition-colors">
                        ✕ Reject
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Live Listings Section */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
          Live Listings
        </h2>
        <div className="space-y-3">
          {approved?.map((rater: Rater) => (
            <div key={rater.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="font-bold text-gray-900 truncate">{rater.business_name}</h3>
                  <StatusBadge status={rater.status} />
                </div>
                <p className="text-sm text-gray-500">{rater.contact_name} · {rater.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">Counties: {rater.counties_served?.join(', ') || '—'}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {rater.status === 'approved' && (
                  <form action={featureRater.bind(null, rater.id)}>
                    <button type="submit" className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors">
                      ⭐ Feature
                    </button>
                  </form>
                )}
                {rater.status === 'featured' && (
                  <form action={approveRater.bind(null, rater.id)}>
                    <button type="submit" className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-200 transition-colors">
                      Unfeature
                    </button>
                  </form>
                )}
                <form action={rejectRater.bind(null, rater.id)}>
                  <button type="submit" className="bg-accent-100 text-accent-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-accent-200 transition-colors">
                    Remove
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
