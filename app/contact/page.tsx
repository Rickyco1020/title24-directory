import Link from 'next/link'
import type { Metadata } from 'next'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact | Title 24 Directory',
  description: 'Get in touch with Title 24 Directory. Questions about your listing, reporting incorrect information, or general Title 24 compliance questions.',
}

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
      <p className="text-gray-500 mb-12">Have a question about the directory or your listing? We're here to help.</p>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
        {/* Left: contact form */}
        <div className="md:col-span-3">
          <ContactForm />
        </div>

        {/* Right: info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-blue-50 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 mb-3">Are you a rater?</h2>
            <p className="text-gray-600 text-sm mb-4">Get your business listed in the directory — completely free. Reach contractors, builders, and homeowners across California.</p>
            <Link href="/get-listed" className="inline-block bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors">
              Get Listed Free →
            </Link>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 mb-3">Common questions</h2>
            <ul className="space-y-3 text-sm">
              <li><Link href="/resources/what-is-a-hers-rater" className="text-blue-700 hover:underline font-medium">What is a HERS / ECC Rater?</Link></li>
              <li><Link href="/resources/cf2r-vs-cf3r" className="text-blue-700 hover:underline font-medium">CF2R vs CF3R — what's the difference?</Link></li>
              <li><Link href="/resources/title-24-compliance-guide" className="text-blue-700 hover:underline font-medium">Title 24 compliance guide for builders</Link></li>
              <li><Link href="/resources" className="text-blue-700 hover:underline font-medium">Browse all resources →</Link></li>
            </ul>
          </div>

          <p className="text-sm text-gray-400 px-1">Response time: 1–2 business days.</p>
        </div>
      </div>
    </div>
  )
}
