import Link from 'next/link'
import type { Metadata } from 'next'
import { absoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Title 24 Guides & Resources',
  description: 'Free guides and articles about California Title 24 energy code compliance, HERS ratings, ECC requirements, and more.',
  alternates: { canonical: absoluteUrl('/resources') },
}

const articles = [
  { slug: 'what-is-a-hers-rater', title: 'What Is a HERS Rater (Now Called an ECC Rater) and When Do You Need One?', excerpt: 'Learn what a HERS Rater does, how the role is transitioning to ECC Rater under the 2025 energy code, and how to find one for your California project.', tags: ['HERS', 'ECC'] },
  { slug: 'cf2r-vs-cf3r', title: 'CF2R vs CF3R: What\'s the Difference?', excerpt: 'Understanding the difference between CF2R installer certificates and CF3R verifier certificates for Title 24 compliance.', tags: ['Forms'] },
  { slug: 'title-24-compliance-guide', title: 'California Title 24 Compliance: A Builder\'s Complete Guide', excerpt: 'A complete guide to navigating California\'s Title 24 energy code for new construction and major renovations.', tags: ['Compliance'] },
  { slug: 'what-is-acceptance-testing', title: 'What Does an Acceptance Tester Do? Title 24 Acceptance Testing Explained', excerpt: 'Title 24 acceptance testing explained: what it covers, when it\'s required, and how to find a certified tester.', tags: ['Compliance'] },
  { slug: 'hers-vs-ecc-rater', title: 'HERS Rater or ECC Rater? Same Role, New Name', excerpt: 'HERS and ECC raters are the same certified field verifier under two names. Which term applies depends on your permit \u2014 and the ECC Writer is a different job.', tags: ['HERS', 'ECC'] },
  { slug: 'title-24-solar-requirements', title: 'Title 24 Solar PV Requirements for New Construction in California', excerpt: 'California requires solar PV on most new construction and battery storage on some building types. What Title 24 mandates, what\'s exempt, and who verifies it.', tags: ['Solar', 'Compliance'] },
  { slug: 'what-is-a-cf1r', title: 'What Is a CF1R? California Title 24 Compliance Report Explained', excerpt: 'The CF1R is the foundation of every Title 24 project. Learn what it contains, who prepares it, and how it connects to the CF2R and CF3R.', tags: ['Forms', 'Compliance'] },
  { slug: 'duct-leakage-testing', title: 'Duct Leakage Testing in California: What to Expect', excerpt: 'Duct leakage testing is one of the most common HERS requirements. Learn what it measures, when it\'s required, and how to prepare for a clean test.', tags: ['HVAC', 'HERS'] },
  { slug: 'heat-pump-water-heater-title-24', title: 'Heat Pump Water Heater Requirements Under California Title 24', excerpt: 'The 2022 standards made heat pump water heaters the baseline for new single-family homes, and the 2025 code extends that to multifamily. What that means.', tags: ['HVAC', 'Compliance'] },
  { slug: 'performance-path-title-24', title: 'The Performance Path to Title 24 Compliance: How Heat Pumps, Mini Splits, and R-21 Work Together', excerpt: 'How the Title 24 performance path lets you trade efficiency measures \u2014 heat pump water heaters, ductless mini splits, R-21 insulation \u2014 for design freedom.', tags: ['Compliance', 'HVAC'] },
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

      {/* The one outbound link on the site, and it belongs here rather than in
          the sitewide footer: readers who finish "What is a CF1R" ask where the
          report itself comes from, and that is a different job from the
          verification this directory indexes. `noopener` without `noreferrer`
          so the referrer survives and the traffic is attributable. */}
      <p className="mt-8 max-w-[68ch] text-sm leading-relaxed text-muted">
        Looking for the compliance report rather than the verifier?{' '}
        <a
          href="https://t24studio.com/hers-ecc-verification/"
          target="_blank"
          rel="noopener"
          className="text-accent underline decoration-accent-rule underline-offset-2 hover:decoration-accent"
        >
          Title 24 reports (CF1R)
        </a>{' '}
        are prepared by T24 Studio.
      </p>

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
