'use client'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { HONEYPOT_FIELD } from '@/lib/forms'
import { submitContactForm } from './actions'
import Link from 'next/link'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}
      className="w-full bg-blue-700 text-white py-3 rounded-xl font-bold text-base hover:bg-blue-800 transition-colors disabled:opacity-60">
      {pending ? 'Sending...' : 'Send Message →'}
    </button>
  )
}

export default function ContactForm() {
  const [state, action] = useActionState(submitContactForm, { success: false })

  if (state.success) {
    return (
      <div className="py-16 text-center">
        <div className="text-6xl mb-6">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Message Sent</h2>
        <p className="text-gray-600 text-lg mb-8">Thanks for reaching out — we'll get back to you within 1–2 business days.</p>
        <Link href="/" className="text-blue-700 font-semibold hover:underline">Back to Home →</Link>
      </div>
    )
  }

  const fe = state.fieldErrors ?? {}

  return (
    <form action={action} className="space-y-5">
      {/* Honeypot — hidden from humans, irresistible to form-filling bots. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor={HONEYPOT_FIELD}>Fax number</label>
        <input id={HONEYPOT_FIELD} name={HONEYPOT_FIELD} type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Name <span className="text-red-500">*</span></label>
          <input required type="text" name="name" placeholder="Full name"
            className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 ${fe.name ? 'border-red-400' : 'border-gray-300'}`} />
          {fe.name && <p className="text-red-500 text-sm mt-1">{fe.name[0]}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
          <input required type="email" name="email" placeholder="you@company.com"
            className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 ${fe.email ? 'border-red-400' : 'border-gray-300'}`} />
          {fe.email && <p className="text-red-500 text-sm mt-1">{fe.email[0]}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject <span className="text-red-500">*</span></label>
        <select required name="subject"
          className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white ${fe.subject ? 'border-red-400' : 'border-gray-300'}`}>
          <option value="">Select a topic...</option>
          <option>Question about my listing</option>
          <option>Report incorrect information</option>
          <option>General question about Title 24</option>
          <option>Partnership or advertising</option>
          <option>Other</option>
        </select>
        {fe.subject && <p className="text-red-500 text-sm mt-1">{fe.subject[0]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message <span className="text-red-500">*</span></label>
        <textarea required name="message" rows={5} placeholder="How can we help?"
          className={`w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none ${fe.message ? 'border-red-400' : 'border-gray-300'}`} />
        {fe.message && <p className="text-red-500 text-sm mt-1">{fe.message[0]}</p>}
      </div>

      {state.error && <p className="text-red-500 text-sm">{state.error}</p>}
      <SubmitButton />
    </form>
  )
}
