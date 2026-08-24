import { createServiceClient } from '@/lib/supabase'
import ClaimForm from './ClaimForm'
import Breadcrumb from '@/components/Breadcrumb'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Claim or Remove a Listing | Title 24 Directory',
  description:
    'Claim your business listing, correct its details, or ask us to remove it from the California Title 24 rater directory.',
  robots: { index: false },
}

export const dynamic = 'force-dynamic'

export default async function ClaimPage({
  searchParams,
}: { searchParams: Promise<{ listing?: string }> }) {
  const { listing } = await searchParams

  let businessName: string | undefined
  if (listing) {
    // Only ever prefill from a listing that is already public. Without the
    // status filter a guessed id would confirm the existence — and name — of a
    // row still sitting in the review queue.
    const { data } = await createServiceClient()
      .from('raters')
      .select('business_name')
      .eq('id', listing)
      .in('status', ['approved', 'featured'])
      .single()
    businessName = data?.business_name
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Claim a listing' }]} />

      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        {businessName ? `Is ${businessName} your business?` : 'Claim or remove a listing'}
      </h1>

      <p className="text-gray-600 leading-relaxed mb-8">
        Some listings in this directory were compiled from publicly published business
        information so that contractors searching a city could find someone local, rather
        than an empty page. If one of them is yours, you can take it over, fix it, or have
        it taken down — whichever you prefer. We don&rsquo;t ask for a reason.
      </p>

      <ClaimForm raterId={listing} businessName={businessName} />
    </div>
  )
}
