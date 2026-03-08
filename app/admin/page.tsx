import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase'
import { updateRaterStatus, adminLogout, isAuthenticated } from './actions'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Admin | Title 24 Directory' }
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

  const pendingCount = pending?.length ?? 0
  const approvedCount = approved?.length ?? 0

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Manage rater listings</p>
        </div>
        <form action={adminLogout}>
          <button type="submit" className="text-sm text-gray-500 hover:text-red-600 font-medium border border-gray-200 rounded-lg px-4 py-2 hover:border-red-300 transition-colors">
            Log Out
          </button>
        </form>
      </div>

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
            {pending!.map((rater: any) => (
              <div key={rater.id} className="bg-white border-2 border-yellow-200 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 truncate">{rater.business_name}</h3>
                      <StatusBadge status={rater.status} />
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{rater.contact_name} · <a href={`mailto:${rater.email}`} className="text-blue-600 hover:underline">{rater.email}</a>{rater.phone ? ` · ${rater.phone}` : ''}</p>
                    {rater.website && <p className="text-sm text-blue-600 hover:underline mb-1"><a href={rater.website} target="_blank" rel="noopener noreferrer">{rater.website}</a></p>}
                    {rater.license_number && <p className="text-sm text-gray-500 mb-2">License: {rater.license_number}</p>}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {rater.services?.map((s: string) => (
                        <span key={s} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mb-1">
                      <strong>Counties:</strong> {rater.counties_served?.join(', ') || '—'}
                    </p>
                    {rater.cities_served?.length > 0 && (
                      <p className="text-xs text-gray-500 mb-1">
                        <strong>Cities:</strong> {rater.cities_served.join(', ')}
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
                      <button type="submit" className="w-full bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors">
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
          {approved?.map((rater: any) => (
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
                  <button type="submit" className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-200 transition-colors">
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
