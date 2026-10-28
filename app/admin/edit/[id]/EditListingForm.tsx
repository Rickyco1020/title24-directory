'use client'
import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from 'react'
import { saveListingEdit } from '../../edit-actions'
import type { EditState } from '@/lib/admin-edit'

export type Option = { value: string; label: string }

export type EditFormInitial = {
  id: string
  status: 'pending' | 'approved' | 'featured'
  business_name: string
  contact_name: string
  email: string
  phone: string
  website: string
  license_number: string
  services: string[]
  counties_served: string[]
  cities_served: string
  description: string
}

const TEXT_FIELDS = [
  { name: 'business_name', label: 'Business name', required: true, type: 'text' },
  { name: 'contact_name', label: 'Contact name', required: true, type: 'text' },
  { name: 'email', label: 'Email', required: true, type: 'email' },
  { name: 'phone', label: 'Phone', required: false, type: 'tel' },
  // type="text", not "url": the browser's url check rejects the bare domains
  // ("example.com") that existing listings store and the server accepts.
  { name: 'website', label: 'Website', required: false, type: 'text' },
  { name: 'license_number', label: 'License / certification number', required: false, type: 'text' },
] as const

const inputClass = (hasError: boolean) =>
  `w-full rounded-lg border px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 ${
    hasError ? 'border-red-400' : 'border-gray-300'
  }`

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null
  return (
    <p role="alert" className="mt-1 text-xs text-red-600">
      {messages[0]}
    </p>
  )
}

function Buttons({ isPendingListing, pending }: { isPendingListing: boolean; pending: boolean }) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="submit"
        name="intent"
        value="save"
        disabled={pending}
        className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save changes'}
      </button>
      {isPendingListing && (
        <button
          type="submit"
          name="intent"
          value="approve"
          disabled={pending}
          className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
        >
          Save &amp; Approve
        </button>
      )}
    </div>
  )
}

export default function EditListingForm({
  initial,
  serviceOptions,
  countyOptions,
  descriptionMax,
}: {
  initial: EditFormInitial
  serviceOptions: Option[]
  countyOptions: Option[]
  descriptionMax: number
}) {
  const [state, action, pending] = useActionState<EditState, FormData>(saveListingEdit, {})
  const [description, setDescription] = useState(initial.description)
  const [dirty, setDirty] = useState(false)
  const submitting = useRef(false)

  // Warn before leaving with unsaved changes. Cleared on submit so the save's
  // own redirect does not trigger it.
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (submitting.current) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  // A save that comes back with an error leaves the form still dirty, so arm
  // the warning again.
  useEffect(() => {
    if (state.error) submitting.current = false
  }, [state])

  // Dispatched by hand rather than through <form action>: React resets an
  // action form's uncontrolled inputs when the action settles, which would
  // throw away the operator's edits on a validation error.
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null
    const data = new FormData(e.currentTarget, submitter)
    submitting.current = true
    startTransition(() => action(data))
  }

  const fe = state.fieldErrors ?? {}
  const over = description.length > descriptionMax

  return (
    <form
      onSubmit={onSubmit}
      onChange={() => setDirty(true)}
      className="space-y-8"
      // The browser would otherwise block "Save" on fields the server treats
      // more leniently; the server validates everything and returns errors.
      noValidate
    >
      <input type="hidden" name="id" value={initial.id} />

      <fieldset className="space-y-4">
        <legend className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-700">Business</legend>
        {TEXT_FIELDS.map(f => (
          <div key={f.name}>
            <label htmlFor={f.name} className="mb-1 block text-sm font-medium text-gray-800">
              {f.label}
              {f.required ? <span className="ml-1 text-red-500">*</span> : <span className="ml-1.5 text-gray-400">optional</span>}
            </label>
            <input
              id={f.name}
              name={f.name}
              type={f.type}
              defaultValue={initial[f.name]}
              aria-invalid={fe[f.name] ? true : undefined}
              className={inputClass(Boolean(fe[f.name]))}
            />
            <FieldError messages={fe[f.name]} />
          </div>
        ))}
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-700">
          Services <span className="text-red-500">*</span>
        </legend>
        <div className="space-y-1.5">
          {serviceOptions.map(o => (
            <label key={o.value} className="flex items-center gap-2 text-sm text-gray-800">
              <input
                type="checkbox"
                name="services"
                value={o.value}
                defaultChecked={initial.services.includes(o.value)}
                className="h-4 w-4"
              />
              {o.label}
            </label>
          ))}
        </div>
        <FieldError messages={fe.services} />
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-700">
          Counties served <span className="text-red-500">*</span>
        </legend>
        <div className="grid max-h-56 grid-cols-2 gap-x-4 gap-y-1 overflow-y-auto rounded-lg border border-gray-300 p-3 sm:grid-cols-3">
          {countyOptions.map(o => (
            <label key={o.value} className="flex items-center gap-2 text-sm text-gray-800">
              <input
                type="checkbox"
                name="counties_served"
                value={o.value}
                defaultChecked={initial.counties_served.includes(o.value)}
                className="h-4 w-4"
              />
              {o.label}
            </label>
          ))}
        </div>
        <FieldError messages={fe.counties_served} />
      </fieldset>

      <div>
        <label htmlFor="cities_served" className="mb-1 block text-sm font-medium text-gray-800">
          Cities served <span className="ml-1.5 text-gray-400">optional, comma-separated</span>
        </label>
        <textarea
          id="cities_served"
          name="cities_served"
          rows={3}
          defaultValue={initial.cities_served}
          className={inputClass(Boolean(fe.cities_served))}
        />
        <FieldError messages={fe.cities_served} />
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-800">
          Description <span className="ml-1.5 text-gray-400">optional · shown on the public listing</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          value={description}
          onChange={e => setDescription(e.target.value)}
          className={inputClass(Boolean(fe.description) || over)}
        />
        <p className={`mt-1 text-right text-xs ${over ? 'font-semibold text-red-600' : 'text-gray-500'}`}>
          {description.length} / {descriptionMax}
        </p>
        <FieldError messages={fe.description} />
      </div>

      {state.error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <Buttons isPendingListing={initial.status === 'pending'} pending={pending} />
      <p className="text-xs text-gray-400">
        Saving never changes the listing&apos;s status, URL, submitted date or featured flag
        {initial.status === 'pending' ? ' — only Save & Approve publishes it.' : '.'}
      </p>
    </form>
  )
}
