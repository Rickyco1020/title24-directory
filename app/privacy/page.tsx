import Link from 'next/link'
import type { Metadata } from 'next'
import { ADMIN_EMAIL, absoluteUrl } from '@/lib/site'
import LegalPage, { LegalList, LegalSection } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'What Title 24 Directory collects, what it publishes, and how a business gets its own listing corrected or removed.',
  alternates: { canonical: absoluteUrl('/privacy') },
}

/** One place to change the date, and one place a reviewer can check it. */
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

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated={UPDATED}
      standfirst="What this site collects, what it publishes, and how a business gets its own information corrected or taken down."
    >
      <LegalSection heading="The short version">
        <LegalList
          items={[
            <>
              Title 24 Directory is a public directory of California Title 24 compliance
              professionals. You don&rsquo;t need an account to use it. There is nothing to sign up
              for and no password to set.
            </>,
            <>
              We collect personal information in exactly three places: the listing form, the contact
              form, and the claim / correct / remove form. If you haven&rsquo;t used one of those, we
              hold nothing about you beyond the ordinary request logs our host keeps.
            </>,
            <>
              We don&rsquo;t sell personal information, and we don&rsquo;t share it for
              cross-context behavioural advertising.
            </>,
            <>
              Most listings here were compiled by us from publicly published business information —
              the businesses did not submit them. If one of those is yours, the next section is the
              one that matters.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection heading="If we listed your business and you never asked us to">
        <p>
          Building a directory that was useful on day one meant publishing some listings we
          researched from public sources rather than waiting for every business to find us. A
          listing compiled that way says so on its own card, with a link to the form that fixes it.
        </p>
        <p>You can do any of three things, and you don&rsquo;t have to give a reason:</p>
        <LegalList
          items={[
            <>
              <strong className="text-ink">Claim it</strong> — it becomes yours to keep and to
              correct.
            </>,
            <>
              <strong className="text-ink">Correct it</strong> — tell us which detail is wrong.
            </>,
            <>
              <strong className="text-ink">Have it removed</strong> — the whole listing comes off
              the site.
            </>,
          ]}
        />
        <p>
          All three go through <A href="/claim">the claim form</A>. You can also just email{' '}
          <Mail />, say which listing and what you want, and it reaches the same person.
        </p>
        <p>
          Removals have one extra step, and it protects you rather than us. A listing&rsquo;s ID
          appears on its own public page, so anyone could file a removal in a competitor&rsquo;s
          name. Before a listing comes down we send a confirmation link to the email address already
          on file for that listing. The link works once and expires after 48 hours. If there is no
          address on file to confirm against, the request is flagged and handled by hand instead.
        </p>
      </LegalSection>

      <LegalSection heading="What each form collects">
        <p>
          <strong className="text-ink">Get listed.</strong> Required: business name, contact name,
          email address, at least one service, and at least one county. Optional: phone number,
          website, certification or licence number, the cities you serve, and a description of up to
          500 characters. This is stored in our database as a listing, initially marked pending
          review.
        </p>
        <p>
          <strong className="text-ink">Contact.</strong> Your name, email address, a subject, and
          your message. Contact messages are never written to the database. They are emailed to the
          operator, with a copy to you confirming we got it, and after that they live in an email
          inbox like any other email.
        </p>
        <p>
          <strong className="text-ink">Claim, correct or remove.</strong> Your name, your email
          address, which listing it concerns, which of the three things you want, and optionally a
          phone number and a message. These are stored in a separate table that nothing public can
          read — the database grants no public access to it at all, so it can only be read with the
          server&rsquo;s own credentials.
        </p>
      </LegalSection>

      <LegalSection heading="What ends up published">
        <p>
          Once a listing is approved, everything on it is public: business name, contact name, email
          address, phone number, website, services, counties and cities served, certification number
          and description. The email address and phone number are published as working links,
          because that is the entire point of a trade directory — someone with a job needs to be
          able to reach you.
        </p>
        <p>
          That is the only personal information this site publishes, and it is business contact
          information. If you&rsquo;d rather a particular field weren&rsquo;t shown, ask: we can drop
          a phone number or an email from a listing and leave the rest of it standing.
        </p>
        <p>Anything you send through the contact or claim forms is never published.</p>
      </LegalSection>

      <LegalSection heading="Cookies">
        <p>
          One cookie exists on this site and it isn&rsquo;t for you. Signing in to the
          operator&rsquo;s admin panel sets a session cookie that lasts eight hours and can&rsquo;t
          be read by JavaScript. Nothing else here sets a cookie. There is no consent banner because
          there is nothing to consent to.
        </p>
      </LegalSection>

      <LegalSection heading="Analytics">
        <p>
          Two measurement tools run on this site, both provided by our host: Vercel Web Analytics
          and Vercel Speed Insights. They record page views and page-loading performance. Neither
          sets a cookie, and neither writes to your browser&rsquo;s local or session storage.
        </p>
        <p>
          There is no Google Analytics, no advertising pixel, and no third-party tracking script on
          this site.
        </p>
      </LegalSection>

      <LegalSection heading="IP addresses">
        <p>
          The three public forms are rate-limited, which means your IP address is read from the
          request while a submission is being processed and held in the server&rsquo;s memory to
          count submissions against a short window. It is not written to the database and it is not
          attached to your listing or your message. If a submission trips the hidden anti-spam
          field, the IP address is written to the server log along with the fact that it happened.
        </p>
        <p>Our host keeps its own request logs, as every web host does.</p>
      </LegalSection>

      <LegalSection heading="Who else handles this data">
        <LegalList
          items={[
            <>
              <strong className="text-ink">Supabase</strong> — the database that holds listings and
              requests.
            </>,
            <>
              <strong className="text-ink">Resend</strong> — sends this site&rsquo;s email: your
              confirmation, the operator&rsquo;s notification, and removal-confirmation links.
            </>,
            <>
              <strong className="text-ink">Vercel</strong> — hosts the site and provides the
              analytics described above.
            </>,
          ]}
        />
        <p>
          Those three process data on our instructions so the site can work. We don&rsquo;t hand
          your details to anyone else, and nobody gets them for their own purposes.
        </p>
      </LegalSection>

      <LegalSection heading="Advertising">
        <p>
          There are no ads on this site. Not an empty slot waiting to fill — no advertising code is
          loaded on any page at all.
        </p>
        <p>
          The codebase contains an unused Google AdSense component, switched off behind an
          environment flag, and advertising may be turned on here in the future. If it is, Google
          and its advertising partners would be able to set cookies and use device identifiers to
          serve and measure ads, and you would be able to control that through{' '}
          <a
            href="https://myadcenter.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline decoration-accent-rule underline-offset-2 hover:decoration-accent"
          >
            Google&rsquo;s own ad settings
          </a>
          . This page will be rewritten before that happens, and the date at the top will change.
          Read this section as a statement of intent, not a description of what runs today.
        </p>
      </LegalSection>

      <LegalSection heading="How long we keep things">
        <LegalList
          items={[
            <>An approved listing stays up until you ask us to take it down.</>,
            <>
              A listing that is submitted and then rejected is deleted from the database at the
              moment it is rejected.
            </>,
            <>
              Claim, correction and removal requests are kept as the record that the request was
              made and acted on.
            </>,
            <>Contact messages persist in the operator&rsquo;s email inbox.</>,
          ]}
        />
      </LegalSection>

      <LegalSection heading="Your rights, in California and elsewhere">
        <p>
          California&rsquo;s privacy law — the CCPA, as amended by the CPRA — gives people the right
          to know what personal information a business holds about them, to have it deleted or
          corrected, to opt out of its sale or sharing, and not to be treated worse for asking. A
          site this small may not meet the thresholds that make those rules binding on it. We honour
          them anyway, and we apply them to everyone, not only Californians.
        </p>
        <LegalList
          items={[
            <>
              <strong className="text-ink">Know.</strong> Ask us what we hold about you and
              we&rsquo;ll tell you. For a listing this page already describes it: it is what
              you&rsquo;ll find on the listing itself.
            </>,
            <>
              <strong className="text-ink">Delete or correct.</strong> Use{' '}
              <A href="/claim">the claim form</A> for anything about a listing, or email us for
              anything else.
            </>,
            <>
              <strong className="text-ink">Opt out of sale or sharing.</strong> There is nothing to
              opt out of. We don&rsquo;t sell personal information and we run no cross-context
              behavioural advertising. If that ever changes, this policy changes first and carries
              the opt-out route with it.
            </>,
            <>
              <strong className="text-ink">No retaliation.</strong> The site is free and there is
              nothing to withhold from you.
            </>,
          ]}
        />
        <p>
          Email <Mail /> to make a request. For anything touching a listing we may ask you to
          confirm from the address already on file for it, for the same reason removals are
          confirmed that way.
        </p>
      </LegalSection>

      <LegalSection heading="Children">
        <p>
          This is a directory of building-trade professionals. It isn&rsquo;t directed at children
          and we don&rsquo;t knowingly collect anything from anyone under 13. If you think a child
          has sent us something, email <Mail /> and we&rsquo;ll delete it.
        </p>
      </LegalSection>

      <LegalSection heading="How this is kept safe">
        <p>
          The site is served over HTTPS only. In the database, approved listings are the only rows
          readable without the server&rsquo;s own credentials — claim, correction and removal
          requests are not publicly readable at all. Removal confirmation links are stored only as a
          hash, work once, and expire after 48 hours. The admin panel is password-gated with no
          default password: if the password isn&rsquo;t configured, signing in is disabled rather
          than left open.
        </p>
        <p>
          None of that makes a system perfect. If you find a problem with it, email <Mail /> — we
          would much rather hear it from you.
        </p>
      </LegalSection>

      <LegalSection heading="Changes to this policy">
        <p>
          When this changes, the date at the top changes with it. There is no mailing list to notify
          — the date is the notification. If a change is material, the summary at the top will say
          what moved.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Email <Mail />, or use <A href="/contact">the contact form</A>. Either reaches the same
          person, usually within one to two business days.
        </p>
        <p>
          See also <A href="/terms">the terms of service</A>, which covers what this directory is
          and what it isn&rsquo;t.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
