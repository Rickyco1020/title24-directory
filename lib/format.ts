// Listings arrive from three sources — a submitted form, a claim, and the
// seeder — so phone numbers reach the database in whatever shape someone typed
// them: '650-269-3470', '(408) 330-6170', '408.330.6170'. A results page that
// mixes those reads as three different databases stitched together, so the
// formatting happens at display time rather than being trusted to the row.

/** Every digit in a phone string, with a leading US country code dropped. */
function digitsOnly(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
}

/**
 * A 10-digit US number as (XXX) XXX-XXXX. Anything else — an extension, a
 * short code, a number with prose around it — is handed back untouched:
 * reshaping a string we don't recognise is how a working number stops working.
 */
export function formatPhone(phone: string): string {
  const digits = digitsOnly(phone)
  if (digits.length !== 10) return phone
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

/**
 * The `tel:` target for a stored number. Diallers are the one audience that
 * wants no punctuation at all, so this stays digits-only regardless of how the
 * number is displayed.
 */
export function telHref(phone: string): string {
  const digits = digitsOnly(phone)
  return digits.length === 10 ? `tel:+1${digits}` : `tel:${phone.replace(/[^\d+]/g, '')}`
}

/**
 * A string safe to hand to Google as a meta description.
 *
 * Rater blurbs are free text capped at 500 characters by the submit schema, and
 * article descriptions are written by hand, so both routinely ran past the
 * ~155-160 characters Google renders — the tail was invisible and the visible
 * snippet was whatever the text happened to open with. Cuts on a word boundary
 * so the snippet ends on a whole word, and returns undefined for empty input so
 * callers can fall back to a generated sentence with `??`.
 */
export function truncateForMeta(text: string | null | undefined, limit = 155): string | undefined {
  const trimmed = text?.trim()
  if (!trimmed) return undefined
  if (trimmed.length <= limit) return trimmed
  // One character of the budget belongs to the ellipsis.
  const cut = trimmed.slice(0, limit - 1)
  const lastSpace = cut.lastIndexOf(' ')
  const body = lastSpace > 0 ? cut.slice(0, lastSpace) : cut
  return `${body.replace(/[\s\u2013\u2014.,;:!?-]+$/, '')}\u2026`
}
