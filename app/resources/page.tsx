import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Title 24 Resources | HERS Rater Guides & Compliance Articles',
  description: 'Free guides and articles about California Title 24 energy code compliance, HERS ratings, ECC requirements, and more.',
}

const articles = [
  { slug: 'what-is-a-hers-rater', title: 'What Is a HERS Rater (Now Called an ECC Rater) and When Do You Need One?', excerpt: 'Learn what a HERS Rater does, how the role is transitioning to ECC Rater under the 2025 energy code, and how to find one for your California project.', tags: ['HERS', 'ECC'] },
  { slug: 'cf2r-vs-cf3r', title: 'CF2R vs CF3R: What\'s the Difference?', excerpt: 'Understanding the difference between CF2R installer certificates and CF3R verifier certificates for Title 24 compliance.', tags: ['Forms'] },
  { slug: 'title-24-compliance-guide', title: 'California Title 24 Compliance: A Builder\'s Complete Guide', excerpt: 'A complete guide to navigating California\'s Title 24 energy code for new construction and major renovations.', tags: ['Compliance'] },
  { slug: 'what-is-acceptance-testing', title: 'What Does an Acceptance Tester Do? Title 24 Acceptance Testing Explained', excerpt: 'Title 24 acceptance testing explained — what it covers, when it\'s required, and how to find a certified tester.', tags: ['Compliance'] },
  { slug: 'hers-vs-ecc-rater', title: 'ECC Writer vs. HERS Rater: Which One Does Your Project Need?', excerpt: 'Two different roles, both required on most California projects. Here\'s the difference between the ECC Writer (energy consultant) and the HERS Rater (field verifier).', tags: ['HERS', 'ECC'] },
  { slug: 'title-24-solar-requirements', title: 'Title 24 Solar PV Requirements for New Construction in California', excerpt: 'California requires solar PV on most new construction and battery storage on certain building types. Learn what Title 24 mandates, what\'s exempt, and how a HERS Rater verifies your system.', tags: ['Solar', 'Compliance'] },
  { slug: 'what-is-a-cf1r', title: 'What Is a CF1R? California Title 24 Compliance Report Explained', excerpt: 'The CF1R is the foundation of every Title 24 project. Learn what it contains, who prepares it, and how it connects to the CF2R and CF3R.', tags: ['Forms', 'Compliance'] },
  { slug: 'duct-leakage-testing', title: 'Duct Leakage Testing in California: What to Expect', excerpt: 'Duct leakage testing is one of the most common HERS requirements. Learn what it measures, when it\'s required, and how to prepare for a clean test.', tags: ['HVAC', 'HERS'] },
  { slug: 'heat-pump-water-heater-title-24', title: 'Heat Pump Water Heater Requirements Under California Title 24', excerpt: 'The 2022 standards effectively require heat pump water heaters for most new residential construction. Here\'s what you need to know.', tags: ['HVAC', 'Compliance'] },
  { slug: 'hvac-replacement-hers-rater', title: 'HVAC Replacement and Title 24: When Do You Need a HERS Rater?', excerpt: 'Replacing an HVAC system in California often triggers HERS verification. Learn when it applies and what tests are required.', tags: ['HVAC', 'HERS'] },
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
