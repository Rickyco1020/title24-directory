'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSending(true)
    await new Promise(r => setTimeout(r, 600))
    setSubmitted(true)
    setSending(false)
  }

  if (submitted) {
    return (
      <div className="py-16 text-center">
        <div className="text-6xl mb-6">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Message Sent</h2>
        <p className="text-gray-600 text-lg mb-8">Thanks for reaching out — we'll get back to you within 1–2 business days.</p>
        <Link href="/" className="text-blue-700 font-semibold hover:underline">Back to Home →</Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your Name <span className="text-red-500">*</span></label>
          <input required type="text" name="name" placeholder="Full name"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
          <input required type="email" name="email" placeholder="you@company.com"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Subject <span className="text-red-500">*</span></label>
        <select required name="subject"
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 bg-white">
          <option value="">Select a topic...</option>
          <option>Question about my listing</option>
          <option>Report incorrect information</option>
          <option>General question about Title 24</option>
          <option>Partnership or advertising</option>
          <option>Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message <span className="text-red-500">*</span></label>
        <textarea required name="message" rows={5} placeholder="How can we help?"
          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 resize-none" />
      </div>

      <button type="submit" disabled={sending}
        className="w-full bg-blue-700 text-white py-3 rounded-xl font-bold text-base hover:bg-blue-800 transition-colors disabled:opacity-60">
        {sending ? 'Sending...' : 'Send Message →'}
      </button>
    </form>
  )
}
