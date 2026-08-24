import { createServiceClient } from '@/lib/supabase'
import { confirmRemoval } from '../actions'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Confirm a removal | Title 24 Directory',
  robots: { index: false },
}

export const dynamic = 'force-dynamic'

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
      <div className="text-gray-600 leading-relaxed space-y-4">{children}</div>
    </div>
  )
}

export default async function VerifyRemovalPage({
  searchParams,
}: { searchParams: Promise<{ token?: string; done?: string }> }) {
  const { token, done } = await searchParams

  if (done === '1') {
    return (
      <Shell title="Removal confirmed">
        <p>
          Thanks — that&rsquo;s confirmed. We&rsquo;ll take the listing down shortly. You don&rsquo;t
          need to do anything else.
        </p>
      </Shell>
    )
  }

  if (!token || !/^[a-f0-9]{64}$/.test(token)) {
    return (
      <Shell title={`This link isn\u2019t valid`}>
        <p>
          The confirmation link is missing or has already been used. If you still want the listing
          removed, start again from the <a href="/claim" className="text-blue-700 hover:underline">claim page</a>.
        </p>
      </Shell>
    )
  }

  // Look up by token only — nothing about the request is exposed without it.
  const { data: request } = await createServiceClient()
    .from('listing_requests')
    .select('business_name, verification_status, created_at')
    .eq('verify_token', token)
    .single()

  if (!request) {
    return (
      <Shell title={`This link isn\u2019t valid`}>
        <p>
          The confirmation link is missing or has already been used. If the listing is still up and
          you want it gone, start again from the{' '}
          <a href="/claim" className="text-blue-700 hover:underline">claim page</a>.
        </p>
      </Shell>
    )
  }

  async function confirm() {
    'use server'
    const { redirect } = await import('next/navigation')
    await confirmRemoval(token!)
    redirect('/claim/verify?done=1')
  }

  return (
    <Shell title="Confirm this removal">
      <p>
        Someone asked us to remove{' '}
        <strong className="text-gray-900">{request.business_name || 'this listing'}</strong> from the
        Title 24 Directory. Because this address is the one on file for the listing, we&rsquo;re
        asking you to confirm before we act.
      </p>
      <p className="text-sm text-gray-500">
        If you didn&rsquo;t ask for this, close this page — nothing will change.
      </p>
      <form action={confirm}>
        <button
          type="submit"
          className="bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800"
        >
          Yes, remove the listing
        </button>
      </form>
    </Shell>
  )
}
