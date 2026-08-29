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
