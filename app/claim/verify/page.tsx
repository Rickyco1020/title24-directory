import { createServiceClient } from '@/lib/supabase'
import { confirmRemoval } from '../actions'
import { ADMIN_EMAIL } from '@/lib/site'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Confirm a removal',
  robots: { index: false },
  // The token rides in the query string; don't leak it in a Referer header.
  referrer: 'no-referrer',
}

export const dynamic = 'force-dynamic'

const TOKEN_RE = /^[a-f0-9]{64}$/

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
      <div className="text-gray-600 leading-relaxed space-y-4">{children}</div>
    </div>
  )
}

function InvalidLink() {
  return (
    <Shell title={`This link isn’t valid`}>
      <p>
        The confirmation link is missing, has expired, or has already been used. If the listing is
        still up and you want it gone, start again from the{' '}
        <a href="/claim" className="text-blue-700 hover:underline">claim page</a> — we&rsquo;ll send a
        fresh confirmation email.
      </p>
    </Shell>
  )
}

export default async function VerifyRemovalPage({
  searchParams,
}: { searchParams: Promise<{ token?: string; state?: string }> }) {
  const { token, state } = await searchParams

  if (state === 'done') {
    return (
      <Shell title="Removal confirmed">
        <p>
          Thanks — that&rsquo;s confirmed. We&rsquo;ll take the listing down shortly. You don&rsquo;t
          need to do anything else.
        </p>
      </Shell>
    )
  }

  if (state === 'failed') {
    return (
      <Shell title={`We couldn’t confirm that`}>
        <p>
          Something went wrong on our side, so the removal is <strong>not</strong> confirmed yet.
          Please email us at{' '}
          {/* title24directory.com publishes no MX records — it sends mail through
              Resend but receives none, so the hello@ address this used to name was
              a black hole on the one page a business lands on when an automated
              removal has already failed. ADMIN_EMAIL is a real, monitored inbox. */}
          <a href={`mailto:${ADMIN_EMAIL}`} className="text-blue-700 hover:underline">
            {ADMIN_EMAIL}
          </a>{' '}
          and we&rsquo;ll take the listing down by hand.
        </p>
      </Shell>
    )
  }

  if (state === 'expired') return <InvalidLink />
  if (!token || !TOKEN_RE.test(token)) return <InvalidLink />

  // Looked up by the token's hash only — nothing about the request is reachable
  // without the link, and the raw token is never stored.
  const { createHash } = await import('crypto')
  const tokenHash = createHash('sha256').update(token).digest('hex')

  const { data: request } = await createServiceClient()
    .from('listing_requests')
    .select('business_name, verification_status')
    .eq('verify_token_hash', tokenHash)
    .single()

  if (!request) return <InvalidLink />

  async function confirm() {
    'use server'
    const { redirect } = await import('next/navigation')
    const result = await confirmRemoval(token!)
    if (result.ok) redirect('/claim/verify?state=done')
    redirect(`/claim/verify?state=${result.reason === 'expired' ? 'expired' : 'failed'}`)
  }

  return (
    <Shell title="Confirm this removal">
      <p>
        We received a request to remove{' '}
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
