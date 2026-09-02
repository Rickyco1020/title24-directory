import Breadcrumb from '@/components/Breadcrumb'

/**
 * The shell both legal pages sit in.
 *
 * Same measure, rules and type scale as an article body
 * (`app/resources/[slug]/page.tsx`) rather than a separate "legal" treatment —
 * these are pages of the site, not a PDF bolted to the footer. Each page owns
 * its own `updated` date, so revising one never silently restamps the other.
 */
export default function LegalPage({
  title,
  updated,
  standfirst,
  children,
}: {
  title: string
  updated: string
  standfirst: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-12 sm:px-6">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: title }]} />

      <article>
        <header className="border-t border-ink pt-6">
          <p className="t-label">Last updated: {updated}</p>
          <h1 className="mt-3 text-[clamp(1.75rem,3.6vw,2.5rem)] font-bold leading-[1.08]">
            {title}
          </h1>
          <p className="mt-4 max-w-[62ch] text-[1.02rem] leading-relaxed">{standfirst}</p>
        </header>

        <div className="mt-10 space-y-10">{children}</div>
      </article>
    </div>
  )
}

/** One section: heading, then prose at the article measure. */
export function LegalSection({
  heading,
  children,
}: {
  heading: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="text-[1.3rem] font-bold leading-snug">{heading}</h2>
      <div className="mt-3 max-w-[68ch] space-y-4 leading-relaxed">{children}</div>
    </section>
  )
}

/** A list inside a section — same measure and rhythm as the prose around it. */
export function LegalList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-muted">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  )
}
