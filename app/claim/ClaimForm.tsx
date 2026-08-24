'use client'
import { useActionState } from 'react'
import { submitClaim, type ClaimState } from './actions'

const initial: ClaimState = { success: false }

const OPTIONS = [
  { value: 'claim',   title: 'This is my business',   blurb: 'Take ownership so you can keep the details current.' },
  { value: 'correct', title: 'Something is wrong',    blurb: 'Phone, service area, or services need correcting.' },
  { value: 'remove',  title: 'Remove this listing',   blurb: "We'll take it down. No reason required." },
]

export default function ClaimForm({
  raterId, businessName,
}: { raterId?: string; businessName?: string }) {
  const [state, action, pending] = useActionState(submitClaim, initial)

  if (state.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Request received</h2>
        <p className="text-gray-600">
          Thanks — we&rsquo;ve got it and will be in touch at the email you gave us.
          Removal requests are actioned promptly.
        </p>
      </div>
    )
  }

  const err = (f: string) => state.fieldErrors?.[f]?.[0]

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="rater_id" value={raterId ?? ''} />

      <fieldset>
        <legend className="block text-sm font-semibold text-gray-900 mb-3">What would you like to do?</legend>
        <div className="space-y-2">
          {OPTIONS.map((o, i) => (
            <label key={o.value}
              className="flex items-start gap-3 border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-blue-300 has-[:checked]:border-blue-600 has-[:checked]:bg-blue-50">
              <input type="radio" name="kind" value={o.value} defaultChecked={i === 0}
                className="mt-1 h-4 w-4 text-blue-700" required />
              <span>
                <span className="block font-semibold text-gray-900">{o.title}</span>
                <span className="block text-sm text-gray-500">{o.blurb}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="business_name" className="block text-sm font-semibold text-gray-900 mb-1">Business name</label>
        <input id="business_name" name="business_name" defaultValue={businessName ?? ''}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5" placeholder="Your company" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="contact_name" className="block text-sm font-semibold text-gray-900 mb-1">Your name *</label>
          <input id="contact_name" name="contact_name" required
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5" />
          {err('contact_name') && <p className="text-sm text-red-600 mt-1">{err('contact_name')}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-1">Email *</label>
          <input id="email" name="email" type="email" required
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5" />
          {err('email') && <p className="text-sm text-red-600 mt-1">{err('email')}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-gray-900 mb-1">Phone</label>
        <input id="phone" name="phone" className="w-full border border-gray-300 rounded-xl px-4 py-2.5" />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-1">Anything else?</label>
        <textarea id="message" name="message" rows={4}
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5"
          placeholder="Corrections, or anything we should know." />
      </div>

      {state.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" disabled={pending}
        className="bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-800 disabled:opacity-60">
        {pending ? 'Sending…' : 'Send request'}
      </button>
    </form>
  )
}
