import Link from 'next/link'
import type { Metadata } from 'next'
import { ADMIN_EMAIL, absoluteUrl } from '@/lib/site'
import LegalPage, { LegalList, LegalSection } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'The terms for using Title 24 Directory: what the directory is, what it is not, and the rules for submitting or removing a listing.',
  alternates: { canonical: absoluteUrl('/terms') },
}

const UPDATED = 'September 1, 2026'

function Mail() {
  return (
    <a
      href={`mailto:${ADMIN_EMAIL}`}
      className="text-accent underline decoration-accent-rule underline-offset-2 hover:decoration-accent"
    >
      {ADMIN_EMAIL}
    </a>
  )
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-accent underline decoration-accent-rule underline-offset-2 hover:decoration-accent"
    >
      {children}
    </Link>
  )
}

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated={UPDATED}
      standfirst="What this directory is, what it isn't, and the rules for listing a business on it. Using the site means you accept these terms."
    >
      <LegalSection heading="What this site is">
        <p>
          Title 24 Directory is an informational directory of California HERS and ECC raters,
          commissioning agents, and acceptance testers. It is free to search and free to be listed
          in. There are no accounts and nothing to buy.
        </p>
        <p>
          It is a starting point for finding someone, not a decision about who to hire. Everything
          below follows from that.
        </p>
      </LegalSection>

      <LegalSection heading="We do not endorse, certify, or verify anyone">
        <p>
          This is the most important thing on this page. A listing here is not a recommendation, an
          endorsement, a vetting, or a statement that the business is qualified for your project. We
          have not inspected anyone&rsquo;s work, checked anyone&rsquo;s insurance, or confirmed
          anyone&rsquo;s certification.
        </p>
        <p>
          HERS and ECC certification is administered by California Energy Commission-approved
          providers — CalCERTS and CHEERS among them — not by us. A certification or licence number
          shown on a listing is what the business told us, or what we found published. It is not a
          number we checked, and it may be out of date.
        </p>
        <p>
          <strong className="text-ink">
            Verify a rater&rsquo;s certification yourself before you hire them.
          </strong>{' '}
          Ask the provider that issued it, and confirm with the building department for your
          jurisdiction that the person you are hiring can sign off the work you need signed off.
        </p>
      </LegalSection>

      <LegalSection heading="This is not professional advice">
        <p>
          The articles and guides on this site describe how Title 24 compliance generally works.
          They are written to be useful, not to be relied on as legal, engineering, or
          code-compliance advice for a particular building. The energy code changes, and it applies
          differently to different projects. For your project, ask a qualified professional and your
          building department.
        </p>
      </LegalSection>

      <LegalSection heading="Where the listings came from">
        <p>
          Some listings were submitted by the business. Others were compiled by us from publicly
          published business information so that someone searching a city would find a real result
          rather than an empty page. A listing compiled that way is labelled on its own card.
        </p>
        <p>
          If a listing is yours, you can claim it, correct it, or have it removed, and you
          don&rsquo;t need to give a reason. Use <A href="/claim">the claim form</A> or email{' '}
          <Mail />. <A href="/privacy">The privacy policy</A> describes exactly how that works,
          including the confirmation step on removals.
        </p>
      </LegalSection>

      <LegalSection heading="If you submit a listing">
        <p>By submitting a listing you tell us that:</p>
        <LegalList
          items={[
            <>
              You are the business, or you are authorised by it to submit its information. Listing
              someone else&rsquo;s business without their say-so is not allowed.
            </>,
            <>
              The information is accurate as of the day you submit it, and you&rsquo;ll tell us when
              it stops being accurate.
            </>,
            <>
              You actually hold any certification, licence, or credential the listing claims, and
              you are permitted to offer the services it lists.
            </>,
            <>
              You are giving us permission to publish that information on this site and to show it
              on the city, county and climate-zone pages it belongs on.
            </>,
          ]}
        />
        <p>
          On our side: a submission is reviewed before it appears, usually within one to two
          business days. We may edit a listing for consistency — city and county names get
          normalised so search finds them — and we may decline it, hold it, or take it down later,
          with or without notice. Listing is free, and it buys no right to appear, to appear in any
          particular position, or to stay up.
        </p>
      </LegalSection>

      <LegalSection heading="Using the site">
        <p>
          Search it, read it, and contact the people on it about work. What you may not do:
        </p>
        <LegalList
          items={[
            <>
              Scrape or bulk-extract the directory, or copy it wholesale into another product or
              list.
            </>,
            <>
              Use published contact details to send unsolicited bulk email, marketing, or anything
              the recipient did not ask for. Those addresses are there so people can hire these
              businesses.
            </>,
            <>
              Submit false, misleading, or automated entries, or work around the rate limits and
              anti-spam measures on the forms.
            </>,
            <>
              File a claim, correction, or removal request for a business that is not yours.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection heading="No warranty">
        <p>
          The site is provided as it is. We do not promise that the directory is complete, current,
          or accurate, that any particular rater is available or suitable, or that the site will be
          uninterrupted or error-free. A business missing from this directory has not been judged
          and rejected — most likely we simply haven&rsquo;t listed it yet.
        </p>
        <p>
          To the extent the law allows, we disclaim the implied warranties of merchantability,
          fitness for a particular purpose, and non-infringement.
        </p>
      </LegalSection>

      <LegalSection heading="Limitation of liability">
        <p>
          To the extent the law allows, we are not liable for indirect, incidental, special, or
          consequential damages, or for lost profits, lost data, project delays, failed inspections,
          or work performed by anyone you found through this site. Your relationship with a rater is
          between you and them.
        </p>
        <p>
          Where liability cannot be excluded, it is limited to one hundred US dollars in total. The
          site is free to use, which is the reason that number is what it is rather than something
          bigger.
        </p>
        <p>
          Nothing here limits liability for fraud, or for anything else that cannot be limited under
          California law.
        </p>
      </LegalSection>

      <LegalSection heading="Links to other sites">
        <p>
          Listings link out to businesses&rsquo; own websites. We don&rsquo;t control those sites,
          we don&rsquo;t endorse them, and we&rsquo;re not responsible for what is on them. Their
          terms and their privacy policies are theirs.
        </p>
      </LegalSection>

      <LegalSection heading="Our content">
        <p>
          The writing, design, structure and compiled directory on this site are ours, and are
          protected by copyright. You are welcome to link to any page here. You may not republish
          the directory or a substantial part of it as your own.
        </p>
        <p>
          The climate-zone map is drawn from the California Energy Commission&rsquo;s published
          building climate zone boundaries, which are public data. Business names, logos and
          trademarks belong to the businesses they identify.
        </p>
      </LegalSection>

      <LegalSection heading="Governing law">
        <p>
          These terms are governed by the laws of the State of California, without regard to its
          conflict-of-laws rules. Any dispute goes to the state or federal courts located in
          California, and by using the site you agree to those courts hearing it.
        </p>
      </LegalSection>

      <LegalSection heading="Changes to these terms">
        <p>
          These terms can change. When they do, the date at the top changes with them, and the new
          version applies from the day it is posted. If you keep using the site after that, that is
          your acceptance. If a change doesn&rsquo;t suit you, ask us to remove your listing.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Email <Mail />, or use <A href="/contact">the contact form</A>. See also{' '}
          <A href="/privacy">the privacy policy</A>.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
