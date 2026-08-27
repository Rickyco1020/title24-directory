'use server'
import { createServiceClient } from '@/lib/supabase'
import { z } from 'zod'
import { Resend } from 'resend'
import { createHash, randomBytes } from 'crypto'
import { escapeHtml } from '@/lib/security'
import { clientIp, headerSafe, honeypotTripped, rateLimit, rateLimitExceeded } from '@/lib/rate-limit'
import { SITE_URL as SITE_URL_FROM_CONFIG } from '@/lib/site'

const schema = z.object({
  rater_id: z.string().uuid().optional().or(z.literal('')),
  business_name: z.string().max(200).optional(),
  kind: z.enum(['claim', 'correct', 'remove']),
  contact_name: z.string().min(2, 'Your name is required').max(120, 'Max 120 characters'),
  email: z.string().email('A valid email is required').max(200, 'Max 200 characters'),
  phone: z.string().max(40).optional(),
  message: z.string().max(2000).optional(),
})

export type ClaimState = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
  /** Set when a removal request is waiting on the on-file contact to confirm. */
  awaitingVerification?: boolean
}

const LABEL: Record<string, string> = {
  claim: 'Claim this listing',
  correct: 'Correct the details',
  remove: 'Remove this listing',
}

const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60 * 60 * 1000

// A confirmation email is sent to a third party (the listing's on-file
// contact), so one listing can only be made to send a few a day no matter how
// many removal requests are filed against it.
const VERIFY_EMAILS_PER_LISTING = 3
const VERIFY_WINDOW_MS = 24 * 60 * 60 * 1000

/** A confirmation link is single-use and stops working after two days. */
const VERIFY_TTL_MS = 48 * 60 * 60 * 1000

const SITE_URL = SITE_URL_FROM_CONFIG
const NOTIFY_TO = process.env.ADMIN_EMAIL ?? 'rickyco1020@gmail.com'
// Sent from the verified domain, not Resend's shared `resend.dev` sender: the
// shared sender only reliably delivers to the account's own address, and it
// rewrites every link through resend-clicks.com — which would put the
// single-use removal token through a third-party redirector.
const MAIL_FROM = 'Title 24 Directory <noreply@title24directory.com>'

/** Only the hash is stored — the raw token exists only in the email link. */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function maskEmail(email: string): string {
  const [user, domain] = email.split('@')
  if (!domain) return '•••'
  return `${user.slice(0, 1)}${'•'.repeat(Math.max(user.length - 1, 1))}@${domain}`
}

export async function submitClaim(prev: ClaimState, formData: FormData): Promise<ClaimState> {
  const ip = await clientIp()

  if (honeypotTripped(formData)) {
    console.warn('claim: honeypot tripped', { ip, kind: formData.get('kind') })
    return { success: true }
  }

  const key = `claim:${ip}`
  if (rateLimitExceeded(key, RATE_LIMIT)) {
    return {
      success: false,
      error: 'Too many requests from this connection. Please try again later, or email us directly.',
    }
  }

  const parsed = schema.safeParse({
    rater_id: (formData.get('rater_id') as string) ?? '',
    business_name: (formData.get('business_name') as string) ?? '',
    kind: formData.get('kind') as string,
    contact_name: formData.get('contact_name') as string,
    email: formData.get('email') as string,
    phone: (formData.get('phone') as string) ?? '',
    message: (formData.get('message') as string) ?? '',
  })

  if (!parsed.success) {
    // Quota is consumed only by valid submissions, so a typo is not a lockout.
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors }
  }
  rateLimit(key, RATE_LIMIT, RATE_WINDOW_MS)

  const d = parsed.data
  const supabase = createServiceClient()

  // A removal takes a listing off the public site, and the listing's UUID is
  // printed on its own public card — so anyone can file one in a competitor's
  // name. Nothing is actionable until the address already on file for the
  // listing confirms it. Claims and corrections are reviewed by hand and carry
  // no such risk, so they skip the loop.
  let verificationStatus: 'not_required' | 'pending' | 'unverifiable' = 'not_required'
  let rawToken: string | null = null
  let verifySentTo: string | null = null
  // Always the row's own name, never the submitter's — the submitter does not
  // get to choose what a third party reads in an email from this domain.
  let listingName: string | null = null

  if (d.kind === 'remove') {
    verificationStatus = 'unverifiable'
    if (d.rater_id) {
      const { data: rater } = await supabase
        .from('raters')
        .select('email, business_name')
        .eq('id', d.rater_id)
        // Same filter as every other public lookup: a request against a row
        // still in the review queue must not behave differently from one
        // against an id that doesn't exist.
        .in('status', ['approved', 'featured'])
        .single()

      if (rater?.email) {
        const listingKey = `claim-verify:${d.rater_id}`
        if (rateLimitExceeded(listingKey, VERIFY_EMAILS_PER_LISTING)) {
          // Someone is using the confirmation loop to mail this business.
          console.warn('claim: verification email cap reached for listing', d.rater_id)
        } else {
          rateLimit(listingKey, VERIFY_EMAILS_PER_LISTING, VERIFY_WINDOW_MS)
          verificationStatus = 'pending'
          rawToken = randomBytes(32).toString('hex')
          verifySentTo = rater.email
          listingName = rater.business_name ?? null
        }
      }
    }
  }

  const baseRow = {
    rater_id: d.rater_id ? d.rater_id : null,
    business_name: d.business_name || null,
    kind: d.kind,
    contact_name: d.contact_name,
    email: d.email,
    phone: d.phone || null,
    message: d.message || null,
  }

  let { error } = await supabase.from('listing_requests').insert({
    ...baseRow,
    verification_status: verificationStatus,
    verify_token_hash: rawToken ? hashToken(rawToken) : null,
    verify_sent_to: verifySentTo,
  })

  // supabase/003_request_verification.sql adds those three columns. PGRST204 is
  // PostgREST's "column not in the schema cache". If the code ships before the
  // migration runs, save the request anyway rather than losing it — but skip
  // the confirmation email, since nothing would record the token.
  if (error && error.code === 'PGRST204') {
    console.error('listing_requests: verification columns missing — run supabase/003_request_verification.sql')
    rawToken = null
    verifySentTo = null
    verificationStatus = d.kind === 'remove' ? 'unverifiable' : 'not_required'
    ;({ error } = await supabase.from('listing_requests').insert(baseRow))
  }

  if (error) {
    console.error('listing_requests insert failed:', error.message)
    return { success: false, error: 'Something went wrong saving your request. Please email us instead.' }
  }

  const e = {
    business_name: escapeHtml(d.business_name),
    contact_name: escapeHtml(d.contact_name),
    email: escapeHtml(d.email),
    phone: escapeHtml(d.phone),
    message: escapeHtml(d.message),
    rater_id: escapeHtml(d.rater_id),
    label: escapeHtml(LABEL[d.kind]),
  }

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Confirmation request to the address on file for the listing. Nothing the
    // submitter typed appears in this email — only the listing's own name.
    if (rawToken && verifySentTo) {
      const link = `${SITE_URL}/claim/verify?token=${rawToken}`
      const safeName = escapeHtml(listingName ?? 'your listing')
      try {
        await resend.emails.send({
          from: MAIL_FROM,
          to: verifySentTo,
          replyTo: NOTIFY_TO,
          subject: headerSafe(`Confirm removal of ${listingName ?? 'your listing'} from Title 24 Directory`),
          html: `
            <p style="font-family:sans-serif;font-size:15px">We received a request to remove this listing from the Title 24 Directory:</p>
            <p style="font-family:sans-serif;font-size:15px"><strong>${safeName}</strong></p>
            <p style="font-family:sans-serif;font-size:15px">We only act on removals confirmed from this address, which is the one on file for the listing. If this was you, confirm below and we&rsquo;ll take it down. The link works once and expires in 48 hours.</p>
            <p style="font-family:sans-serif;font-size:15px">
              <a href="${escapeHtml(link)}" style="display:inline-block;background:#1d4ed8;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Confirm removal</a>
            </p>
            <p style="font-family:sans-serif;font-size:13px;color:#6b7280">If you didn&rsquo;t ask for this, ignore this email — nothing will change. Reply to us if you&rsquo;d like to know more.</p>`,
        })
      } catch (err) {
        console.error('removal verification email failed:', err)
      }
    }

    // Notify the site owner. Never block the user's confirmation on email.
    const statusLine =
      verificationStatus === 'pending'
        ? `Awaiting confirmation from the address on file (${escapeHtml(maskEmail(verifySentTo ?? ''))}). Do not action until confirmed.`
        : verificationStatus === 'unverifiable'
          ? 'UNVERIFIED — nothing on file to confirm against. Check by hand before actioning.'
          : 'Reviewed by hand — no verification required for this request type.'

    try {
      await resend.emails.send({
        from: MAIL_FROM,
        to: NOTIFY_TO,
        subject: headerSafe(`[${LABEL[d.kind]}] ${d.business_name || d.contact_name}`),
        html: `
          <h2>${e.label}</h2>
          <table style="font-family:sans-serif;font-size:14px">
            <tr><td style="padding:6px 12px 6px 0;color:#6b7280">Request</td><td>${e.label}</td></tr>
            <tr><td style="padding:6px 12px 6px 0;color:#6b7280">Business</td><td>${e.business_name || '—'}</td></tr>
            <tr><td style="padding:6px 12px 6px 0;color:#6b7280">Listing ID</td><td>${e.rater_id || '—'}</td></tr>
            <tr><td style="padding:6px 12px 6px 0;color:#6b7280">Contact</td><td>${e.contact_name}</td></tr>
            <tr><td style="padding:6px 12px 6px 0;color:#6b7280">Email</td><td>${e.email}</td></tr>
            <tr><td style="padding:6px 12px 6px 0;color:#6b7280">Phone</td><td>${e.phone || '—'}</td></tr>
          </table>
          <p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap">${e.message || ''}</p>
          <p style="font-family:sans-serif;font-size:13px;color:#6b7280">${statusLine}</p>`,
      })
    } catch (err) {
      console.error('claim notification email failed:', err)
    }
  }

  return { success: true, awaitingVerification: verificationStatus === 'pending' }
}

export type ConfirmResult = { ok: boolean; reason?: 'invalid' | 'expired' | 'error'; businessName?: string }

/**
 * Called from the confirmation link's page. Marks one removal request verified.
 * The update is conditional on the token hash still being present, so it is
 * atomically single-use even if the button is double-submitted.
 */
export async function confirmRemoval(token: string): Promise<ConfirmResult> {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return { ok: false, reason: 'invalid' }

  const supabase = createServiceClient()
  const tokenHash = hashToken(token)

  const { data: request } = await supabase
    .from('listing_requests')
    .select('id, business_name, created_at')
    .eq('verify_token_hash', tokenHash)
    .single()

  if (!request) return { ok: false, reason: 'invalid' }

  if (Date.now() - new Date(request.created_at).getTime() > VERIFY_TTL_MS) {
    return { ok: false, reason: 'expired', businessName: request.business_name ?? undefined }
  }

  // Clearing the hash in the same statement that matches on it means a second
  // submit updates zero rows rather than re-notifying the admin.
  const { data: updated, error } = await supabase
    .from('listing_requests')
    .update({
      verification_status: 'verified',
      verified_at: new Date().toISOString(),
      verify_token_hash: null,
    })
    .eq('verify_token_hash', tokenHash)
    .select('id, business_name')

  if (error) {
    console.error('removal confirmation failed:', error.message)
    return { ok: false, reason: 'error' }
  }
  if (!updated || updated.length === 0) {
    // Someone else (or a double-click) got there first. Already confirmed.
    return { ok: true, businessName: request.business_name ?? undefined }
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: MAIL_FROM,
        to: NOTIFY_TO,
        subject: headerSafe(`[Removal confirmed] ${request.business_name || 'listing'}`),
        html: `<p style="font-family:sans-serif;font-size:14px">The address on file confirmed the removal of <strong>${escapeHtml(request.business_name)}</strong>. This one is safe to action.</p>
               <p style="font-family:sans-serif;font-size:14px"><a href="${SITE_URL}/admin">Open the admin panel</a></p>`,
      })
    } catch (err) {
      console.error('removal confirmation notification failed:', err)
    }
  }

  return { ok: true, businessName: request.business_name ?? undefined }
}
