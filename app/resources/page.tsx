import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Title 24 Resources | HERS Rater Guides & Compliance Articles',
  description: 'Free guides and articles about California Title 24 energy code compliance, HERS ratings, ECC requirements, and more.',
}

const articles = [
  { slug: 'what-is-a-hers-rater', title: 'What is a HERS Rater? (And When Do You Need One)', excerpt: 'Learn what a HERS rater does, why they\'re required in California, and how to find one for your project.', tags: ['HERS'] },
  { slug: 'cf2r-vs-cf3r', title: 'CF2R vs CF3R: What\'s the Difference?', excerpt: 'Understanding the difference between CF2R installer certificates and CF3R verifier certificates for Title 24 compliance.', tags: ['Forms'] },
  { slug: 'title-24-compliance-guide', title: 'California Title 24 Compliance: A Builder\'s Guide', excerpt: 'A complete guide to navigating California\'s Title 24 energy code for new construction and major renovations.', tags: ['Compliance'] },
  { slug: 'what-is-acceptance-testing', title: 'What Does an Acceptance Tester Do?', excerpt: 'Title 24 acceptance testing explained — what it covers, when it\'s required, and how to find a certified tester.', tags: ['Compliance'] },
  { slug: 'hers-vs-ecc-rater', title: 'ECC Rater vs HERS Rater: Which Do You Need?', excerpt: 'California\'s energy code is changing. Here\'s the difference between HERS and ECC raters and which one your 2025+ project needs.', tags: ['HERS', 'ECC'] },
]

export default function ResourcesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Title 24 Resources</h1>
      <p className="text-gray-500 mb-10">Guides and articles about California energy code compliance</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map(article => (
          <Link key={article.slug} href={`/resources/${article.slug}`} className="block bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex gap-2 mb-3">
              {article.tags.map(tag => (
                <span key={tag} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">{tag}</span>
              ))}
            </div>
            <h2 className="font-bold text-gray-900 text-lg mb-2 hover:text-blue-700 transition-colors">{article.title}</h2>
            <p className="text-gray-500 text-sm">{article.excerpt}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
