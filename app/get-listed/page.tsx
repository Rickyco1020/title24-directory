'use client'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { submitListing } from './actions'
import { HONEYPOT_FIELD, HONEYPOT_STYLE } from '@/lib/forms'
import { CATEGORIES } from '@/lib/categories'
import { CA_COUNTIES } from '@/lib/california-data'
import Link from 'next/link'
import { useState } from 'react'

const FIELDS = [
  { name: 'business_name', label: 'Business name', required: true, type: 'text', placeholder: 'Your company name' },
  { name: 'contact_name', label: 'Contact name', required: true, type: 'text', placeholder: 'Your full name' },
  { name: 'email', label: 'Email address', required: true, type: 'email', placeholder: 'you@company.com' },
  { name: 'phone', label: 'Phone number', required: false, type: 'tel', placeholder: '(555) 555-5555' },
  { name: 'website', label: 'Website', required: false, type: 'url', placeholder: 'https://yoursite.com' },
  { name: 'license_number', label: 'License / certification number', required: false, type: 'text', placeholder: 'CalCERTS or CHEERS ID' },
]

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-red w-full px-6 py-3.5 text-[0.95rem] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? 'Submitting…' : 'Submit my listing →'}
    </button>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p role="alert" className="mt-1.5 text-sm text-red-text">
      {message}
    </p>
  )
}

export default function GetListedPage() {
  const [state, action] = useActionState(submitListing, { success: false })
  const [description, setDescription] = useState('')

  if (state.success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6">
        <div className="border-t border-ink pt-8">
          <p className="t-label text-ink">Received</p>
          <h1 className="mt-3 text-[clamp(1.7rem,3.4vw,2.3rem)] font-bold">Your listing is in the queue.</h1>
          <p className="mt-4 max-w-[54ch] leading-relaxed">
            We review submissions within one to two business days and email you the moment it goes
            live. Nothing else is needed from you.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/directory" className="btn-quiet px-5 py-2.5 text-sm">
              Browse the directory
            </Link>
            <a href="/get-listed" className="btn-quiet px-5 py-2.5 text-sm">
              Submit another listing
            </a>
          </div>
        </div>
      </div>
    )
  }

  const fe = state.fieldErrors ?? {}
  const inputClass = (hasError: boolean) =>
    `w-full rounded border bg-surface px-3.5 py-2.5 text-sm text-ink transition-colors placeholder:text-muted focus:outline-none ${
      hasError ? 'border-red focus:border-red' : 'border-rule focus:border-ink'
    }`

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-12 sm:px-6">
      <h1 className="text-[clamp(1.7rem,3.4vw,2.4rem)] font-bold">Get listed, free</h1>
      <p className="mt-3 max-w-[56ch] leading-relaxed">
        For certified HERS and ECC raters, commissioning agents, and acceptance testers working in
        California. No fee, no account, no renewal.
      </p>

      <form action={action} className="mt-10 space-y-7">
        {/* Honeypot — off-screen for humans, irresistible to form-filling bots. */}
        <div aria-hidden="true" style={HONEYPOT_STYLE}>
          <label htmlFor={HONEYPOT_FIELD}>Leave this field empty</label>
          <input id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <fieldset className="border-t border-ink pt-6">
          <legend className="sr-only">Business details</legend>
          <p className="t-label mb-5">Business</p>

          <div className="space-y-5">
            {FIELDS.map(field => (
              <div key={field.name}>
                <label htmlFor={field.name} className="mb-1.5 block text-sm font-medium text-ink">
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-red-text" aria-hidden="true">
                      *
                    </span>
                  )}
                  {!field.required && <span className="ml-1.5 text-muted">optional</span>}
                </label>
                <input
                  id={field.name}
                  type={field.type}
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  aria-invalid={fe[field.name] ? true : undefined}
                  aria-describedby={fe[field.name] ? `${field.name}-error` : undefined}
                  className={inputClass(Boolean(fe[field.name]))}
                />
                <span id={`${field.name}-error`}>
                  <FieldError message={fe[field.name]?.[0]} />
                </span>
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="border-t border-ink pt-6">
          <legend className="sr-only">Coverage</legend>
          <p className="t-label mb-5">Coverage</p>

          <div className="space-y-6">
            <div>
              <p className="mb-2.5 text-sm font-medium text-ink">
                Services offered
                <span className="ml-1 text-red-text" aria-hidden="true">*</span>
              </p>
              <div className="cell-grid">
                {CATEGORIES.map(cat => (
                  <label
                    key={cat.value}
                    className="flex cursor-pointer items-start gap-3 bg-surface px-4 py-3 transition-colors hover:bg-sunk"
                  >
                    <input
                      type="checkbox"
                      name="services"
                      value={cat.value}
                      className="mt-1 h-4 w-4 shrink-0 accent-[oklch(0.505_0.198_28)]"
                    />
                    <span>
                      <span className="block text-sm font-medium text-ink">{cat.label}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed">{cat.description}</span>
                    </span>
                  </label>
                ))}
              </div>
              <FieldError message={fe.services?.[0]} />
            </div>

            <div>
              <p className="mb-2.5 text-sm font-medium text-ink">
                Counties served
                <span className="ml-1 text-red-text" aria-hidden="true">*</span>
              </p>
              <div className="grid max-h-52 grid-cols-2 gap-x-4 gap-y-1 overflow-y-auto rounded border border-rule bg-surface p-3.5">
                {CA_COUNTIES.map(c => (
                  <label key={c.slug} className="flex cursor-pointer items-center gap-2 py-0.5 text-sm hover:text-ink">
                    <input
                      type="checkbox"
                      name="counties_served"
                      value={c.slug}
                      className="h-4 w-4 shrink-0 accent-[oklch(0.505_0.198_28)]"
                    />
                    <span>{c.name}</span>
                  </label>
                ))}
              </div>
              <FieldError message={fe.counties_served?.[0]} />
            </div>

            <div>
              <label htmlFor="cities_served" className="mb-1.5 block text-sm font-medium text-ink">
                Specific cities <span className="ml-1 text-muted">optional</span>
              </label>
              <textarea
                id="cities_served"
                name="cities_served"
                rows={3}
                placeholder="Leave blank if you cover every city in the counties above"
                className={inputClass(false)}
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="border-t border-ink pt-6">
          <legend className="sr-only">Description</legend>
          <p className="t-label mb-5">Listing copy</p>

          <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-ink">
            Business description <span className="ml-1 text-muted">optional</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            maxLength={500}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="What you do, what you're certified for, and anything a GC would want to know before calling."
            className={inputClass(false)}
          />
          <p className="t-label mt-1.5 text-right">{description.length} / 500</p>
        </fieldset>

        {state.error && (
          <p role="alert" className="rounded border border-red-rule bg-red-wash px-4 py-3 text-sm text-red-text">
            {state.error}
          </p>
        )}

        <SubmitButton />

        <p className="text-xs text-muted">
          Submissions are reviewed within one to two business days. We never sell listing data or
          charge for placement.
        </p>
      </form>
    </div>
  )
}
