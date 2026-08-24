'use client'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { submitListing } from './actions'
import { HONEYPOT_FIELD } from '@/lib/forms'
import { CATEGORIES } from '@/lib/categories'
import { CA_COUNTIES } from '@/lib/california-data'
import { useState } from 'react'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="w-full bg-blue-700 text-white py-3 rounded-xl font-bold text-lg hover:bg-blue-800 transition-colors disabled:opacity-60">
      {pending ? 'Submitting...' : 'Submit My Listing →'}
    </button>
  )
}

export default function GetListedPage() {
  const [state, action] = useActionState(submitListing, { success: false })
  const [description, setDescription] = useState('')

  if (state.success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Listing Submitted!</h1>
        <p className="text-gray-600 text-lg mb-8">Your listing has been submitted! We'll review it within 1–2 business days and email you when it goes live.</p>
        <a href="/get-listed" className="text-blue-700 font-semibold hover:underline">Submit another listing →</a>
      </div>
    )
  }

  const fe = state.fieldErrors ?? {}

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Get Listed in the Title 24 Directory</h1>
      <p className="text-gray-500 mb-8">Free listings for HERS raters, ECC raters, commissioning agents, and acceptance testers across California.</p>

      <form action={action} className="space-y-6">
        {/* Honeypot — hidden from humans, irresistible to form-filling bots. */}
        <div aria-hidden="true" className="hidden">
          <label htmlFor={HONEYPOT_FIELD}>Fax number</label>
          <input id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
        </div>

        {[
          { name: 'business_name', label: 'Business Name', required: true, type: 'text', placeholder: 'Your company name' },
          { name: 'contact_name', label: 'Contact Name', required: true, type: 'text', placeholder: 'Your full name' },
          { name: 'email', label: 'Email Address', required: true, type: 'email', placeholder: 'you@company.com' },
          { name: 'phone', label: 'Phone Number', required: false, type: 'tel', placeholder: '(555) 555-5555' },
          { name: 'website', label: 'Website', required: false, type: 'url', placeholder: 'https://yoursite.com' },
          { name: 'license_number', label: 'License / Certification Number', required: false, type: 'text', placeholder: 'Optional' },
        ].map(field => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            <input type={field.type} name={field.name} placeholder={field.placeholder}
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 ${fe[field.name] ? 'border-red-400' : 'border-gray-300'}`} />
            {fe[field.name] && <p className="text-red-500 text-sm mt-1">{fe[field.name][0]}</p>}
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Services Offered <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CATEGORIES.map(cat => (
              <label key={cat.value} className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-blue-50 transition-colors">
                <input type="checkbox" name="services" value={cat.value} className="rounded" />
                <span className="text-sm font-medium text-gray-700">{cat.label}</span>
              </label>
            ))}
          </div>
          {fe.services && <p className="text-red-500 text-sm mt-1">{fe.services[0]}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Counties Served <span className="text-red-500">*</span></label>
          <div className="border border-gray-300 rounded-lg p-3 h-40 overflow-y-auto grid grid-cols-2 gap-1">
            {CA_COUNTIES.map(c => (
              <label key={c.slug} className="flex items-center space-x-2 cursor-pointer hover:text-blue-700">
                <input type="checkbox" name="counties_served" value={c.slug} className="rounded" />
                <span className="text-sm text-gray-700">{c.name}</span>
              </label>
            ))}
          </div>
          {fe.counties_served && <p className="text-red-500 text-sm mt-1">{fe.counties_served[0]}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Specific Cities Served (optional)</label>
          <textarea name="cities_served" rows={3} placeholder="List specific cities, or leave blank to indicate all cities in your selected counties"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Description (optional)</label>
          <textarea name="description" rows={4} maxLength={500} value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Briefly describe your services, certifications, and service area..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 text-sm" />
          <p className="text-gray-400 text-xs mt-1 text-right">{description.length}/500</p>
        </div>

        {state.error && <p className="text-red-500 text-sm">{state.error}</p>}
        <SubmitButton />
      </form>
    </div>
  )
}
