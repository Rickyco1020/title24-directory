/**
 * Form constants shared by client components and server actions.
 * Kept free of server-only imports so it can be pulled into the client bundle.
 */

/**
 * A hidden field real users never fill in. Bots that blindly complete every
 * input trip it. Server actions treat a trip as a silent success, so the bot
 * gets no signal that it was caught.
 */
export const HONEYPOT_FIELD = 'fax_number'
