/**
 * Shared output-encoding and URL-safety helpers.
 *
 * Everything here exists because user-submitted text from the public forms
 * ends up in three places that are NOT JSX-escaped for us:
 *   1. a <script type="application/ld+json"> block  -> escapeForJsonLd
 *   2. HTML email template literals                 -> escapeHtml
 *   3. href attributes                              -> safeExternalUrl
 */

/** Escape a string for interpolation into an HTML text node or attribute. */
export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Serialise an object for embedding inside a <script> block.
 *
 * JSON.stringify escapes quotes and backslashes but NOT `<`, `>` or `&`, so a
 * value containing `</script><script>...` would break out of the block and
 * execute. Escaping those three characters (plus the two line separators that
 * are valid JSON but invalid JS string literals) makes the payload inert while
 * keeping it valid JSON for crawlers.
 */
export function escapeForJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

/**
 * Return the URL only if it is a plain http(s) link, otherwise null.
 * Blocks `javascript:`, `data:`, `vbscript:` and friends at render time —
 * the second line of defence behind the schema-level check below.
 */
export function safeExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null
  const raw = value.trim()
  if (!raw) return null

  // A bare `example.com` is a hostname, not a scheme-less URL — treat it as
  // https so existing rows keep rendering a working link. Anything that does
  // carry a scheme is parsed as-is and must survive the http(s) check below,
  // so `javascript:` and `data:` are still rejected.
  const candidate = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`

  let parsed: URL
  try {
    parsed = new URL(candidate)
  } catch {
    return null
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
  return parsed.toString()
}

/** True when the string is a well-formed http(s) URL. Used by the zod schemas. */
export function isHttpUrl(value: string): boolean {
  return safeExternalUrl(value) !== null
}
