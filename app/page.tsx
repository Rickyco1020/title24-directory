import Link from 'next/link'
import { redirect } from 'next/navigation'
import { CATEGORIES } from '@/lib/categories'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Title 24 Directory | Find HERS & ECC Raters in California',
  description: 'Find certified HERS raters, ECC raters, commissioning agents, and acceptance testers across California. Free directory, instant results.',
}

function SearchForm() {
  async function handleSearch(formData: FormData) {
    'use server'
    const q = formData.get('q') as string
    redirect(`/directory?q=${encodeURIComponent(q)}`)
  }

  return (
    <form action={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
      <input
        type="text"
        name="q"
        placeholder="Enter city, county, or zip code..."
        className="flex-1 px-5 py-4 rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-blue-200 text-lg focus:outline-none focus:border-white backdrop-blur-sm"
      />
      <button
        type="submit"
        className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-colors whitespace-nowrap shadow-lg"
      >
        Find Raters
      </button>
    </form>
  )
}

export default function HomePage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Find a Title 24 Rater Near You</h1>
          <p className="text-xl text-blue-100 mb-10">California&apos;s most complete directory of HERS raters, ECC raters, commissioning agents, and acceptance testers.</p>
          <SearchForm />
        </div>
      </section>

      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-blue-700">200+</p>
            <p className="text-sm text-gray-500">Cities covered</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-700">58</p>
            <p className="text-sm text-gray-500">Counties</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-700">4</p>
            <p className="text-sm text-gray-500">Service types</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-700">100%</p>
            <p className="text-sm text-gray-500">Free to use</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">Find the Right Professional</h2>
        <p className="text-center text-gray-500 mb-10 max-w-2xl mx-auto">Browse by service type to find the exact certification you need for your project.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map(cat => (
            <Link
              key={cat.value}
              href={`/directory?type=${cat.value}`}
              className="block p-6 bg-white rounded-2xl border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all group"
            >
              <div className="text-3xl mb-3">
                {cat.value === 'hers' ? '🏠' : cat.value === 'ecc' ? '⚡' : cat.value === 'commissioning' ? '🔧' : '✅'}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-700 transition-colors">{cat.label}</h3>
              <p className="text-gray-500 text-sm mb-3">{cat.description}</p>
              <span className="text-blue-700 text-sm font-semibold group-hover:underline">Browse →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Search', desc: 'Enter your city, county, or zip code to find raters in your area.' },
              { step: '2', title: 'Browse', desc: 'Compare raters by service type, location, and contact details.' },
              { step: '3', title: 'Contact', desc: 'Reach out directly to schedule your Title 24 compliance inspection.' },
            ].map(item => (
              <div key={item.step} className="flex flex-col items-center">
                <div className="w-14 h-14 bg-blue-700 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">{item.step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Title 24 Resources</h2>
          <Link href="/resources" className="text-blue-700 font-semibold hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { slug: 'what-is-a-hers-rater', title: 'What Is a HERS Rater (Now Called an ECC Rater)?', excerpt: 'Learn what a HERS Rater does, how the role is becoming ECC Rater under the 2025 energy code, and when you need one.', tag: 'HERS / ECC', readTime: '5 min read' },
            { slug: 'cf2r-vs-cf3r', title: 'CF2R vs CF3R: What\'s the Difference?', excerpt: 'Understanding the difference between installer certificates and verifier certificates in California Title 24.', tag: 'Forms', readTime: '4 min read' },
            { slug: 'title-24-compliance-guide', title: 'California Title 24 Compliance Guide', excerpt: 'A complete guide to Title 24 energy code compliance for builders and contractors. Stay on schedule.', tag: 'Compliance', readTime: '6 min read' },
          ].map(article => (
            <Link key={article.slug} href={`/resources/${article.slug}`} className="group block bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all">
              <div className="flex items-center gap-3 mb-3">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">{article.tag}</span>
                <span className="text-xs text-gray-400">{article.readTime}</span>
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-700 transition-colors">{article.title}</h3>
              <p className="text-gray-500 text-sm mb-4">{article.excerpt}</p>
              <span className="text-blue-700 text-sm font-semibold group-hover:underline">Read article →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-blue-700 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Are You a Title 24 Rater?</h2>
          <p className="text-blue-100 text-lg mb-8">Get your business listed in California&apos;s most complete Title 24 directory — completely free.</p>
          <Link href="/get-listed" className="bg-yellow-400 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-colors inline-block shadow-lg">
            Get Listed Free →
          </Link>
        </div>
      </section>
    </div>
  )
}
