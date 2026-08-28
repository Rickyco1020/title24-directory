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
  { slug: 'what-is-acceptance-testing', title: 'What Does an Acceptance Tester Do? Title 24 Acceptance Testing Explained', excerpt: 'Title 24 acceptance testing explained: what it covers, when it\'s required, and how to find a certified tester.', tags: ['Compliance'] },
  { slug: 'hers-vs-ecc-rater', title: 'HERS Rater or ECC Rater? Same Role, New Name', excerpt: 'HERS and ECC raters are the same certified field verifier. The 2025 energy code renamed the program, and which term applies depends on your permit. Plus the distinction that does matter: the ECC Writer versus the rater.', tags: ['HERS', 'ECC'] },
  { slug: 'title-24-solar-requirements', title: 'Title 24 Solar PV Requirements for New Construction in California', excerpt: 'California requires solar PV on most new construction and battery storage on certain building types. Learn what Title 24 mandates, what\'s exempt, and how a HERS Rater verifies your system.', tags: ['Solar', 'Compliance'] },
  { slug: 'what-is-a-cf1r', title: 'What Is a CF1R? California Title 24 Compliance Report Explained', excerpt: 'The CF1R is the foundation of every Title 24 project. Learn what it contains, who prepares it, and how it connects to the CF2R and CF3R.', tags: ['Forms', 'Compliance'] },
  { slug: 'duct-leakage-testing', title: 'Duct Leakage Testing in California: What to Expect', excerpt: 'Duct leakage testing is one of the most common HERS requirements. Learn what it measures, when it\'s required, and how to prepare for a clean test.', tags: ['HVAC', 'HERS'] },
  { slug: 'heat-pump-water-heater-title-24', title: 'Heat Pump Water Heater Requirements Under California Title 24', excerpt: 'The 2022 standards effectively require heat pump water heaters for most new residential construction. Here\'s what you need to know.', tags: ['HVAC', 'Compliance'] },
  { slug: 'performance-path-title-24', title: 'The Performance Path to Title 24 Compliance: How Heat Pumps, Mini Splits, and R-21 Work Together', excerpt: 'Learn how the Title 24 performance path lets you trade efficiency measures, like heat pump water heaters, ductless mini splits, and R-21 insulation, for more design flexibility.', tags: ['Compliance', 'HVAC'] },
  { slug: 'hvac-replacement-hers-rater', title: 'HVAC Replacement and Title 24: When Do You Need a HERS Rater?', excerpt: 'Replacing an HVAC system in California often triggers HERS verification. Learn when it applies and what tests are required.', tags: ['HVAC', 'HERS'] },
]

export default function ResourcesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-12 sm:px-6 lg:px-8">
      <h1 className="text-[clamp(1.7rem,3.4vw,2.4rem)] font-bold">Title 24, explained</h1>
      <p className="mt-3 max-w-[60ch] text-[0.98rem] leading-relaxed">
        Guides to California&rsquo;s energy code, written for the people who have to comply with it
        rather than the people who wrote it.
      </p>

      {/* A reading list, not a card grid. These are eleven articles of the
          same kind; identical bordered cards made them look like eleven
          products to choose between. */}
      <ul className="mt-10 border-t border-ink">
        {articles.map(article => (
          <li key={article.slug} className="border-b border-rule">
            <Link
              href={`/resources/${article.slug}`}
              className="group flex flex-wrap items-baseline gap-x-6 gap-y-2 py-5 transition-colors hover:bg-sunk sm:flex-nowrap"
            >
              <span className="flex w-[8.5rem] shrink-0 flex-wrap gap-1.5 pt-0.5">
                {article.tags.map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block max-w-[58ch] text-[1.05rem] font-bold leading-snug text-ink transition-colors group-hover:text-accent">
                  {article.title}
                </span>
                <span className="mt-1.5 block max-w-[68ch] text-sm leading-relaxed">
                  {article.excerpt}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <aside className="mt-14 border-t border-ink pt-8">
        <h2 className="text-lg font-bold">Ready to find someone?</h2>
        <p className="mt-2 max-w-[56ch] text-[0.95rem]">
          Every certified rater in California, searchable by city, county, or ZIP.
        </p>
        <Link href="/directory" className="btn-accent mt-5 inline-block px-5 py-2.5 text-sm">
          Find a rater
        </Link>
      </aside>
    </div>
  )
}
