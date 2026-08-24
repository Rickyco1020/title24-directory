/**
 * Form constants shared by client components and server actions.
 * Kept free of server-only imports so it can be pulled into the client bundle.
 */

/**
 * A hidden field real users never fill in. Bots that blindly complete every
 * input trip it. Server actions log the trip and treat it as a silent success,
 * so the bot gets no signal that it was caught.
 *
 * The name deliberately avoids anything a browser or password manager
 * recognises (no `fax`, `phone`, `email`, `address`), and the field is moved
 * off-screen rather than `display:none` — autofill is happy to fill a hidden
 * input, and some bots skip display:none fields on purpose.
 */
export const HONEYPOT_FIELD = 'hp_ref_code'

/** Inline styles for the honeypot wrapper. */
export const HONEYPOT_STYLE = {
  position: 'absolute' as const,
  left: '-9999px',
  width: '1px',
  height: '1px',
  overflow: 'hidden' as const,
}
