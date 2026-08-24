'use server'
import { createServiceClient } from '@/lib/supabase'
import { z } from 'zod'
import { Resend } from 'resend'
import { randomBytes } from 'crypto'
import { escapeHtml } from '@/lib/security'
import { clientIp, honeypotTripped, rateLimit } from '@/lib/rate-limit'

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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://title24directory.com'
const NOTIFY_TO = process.env.ADMIN_EMAIL ?? 'rickyco1020@gmail.com'
const MAIL_FROM = 'Title 24 Directory <onboarding@resend.dev>'

function maskEmail(email: string): string {
  const [user, domain] = email.split('@')
  if (!domain) return '•••'
  const head = user.slice(0, 1)
  return `${head}${'•'.repeat(Math.max(user.length - 1, 1))}@${domain}`
}

export async function submitClaim(prev: ClaimState, formData: FormData): Promise<ClaimState> {
  if (honeypotTripped(formData)) return { success: true }

  const ip = await clientIp()
  if (!rateLimit(`claim:${ip}`, RATE_LIMIT, RATE_WINDOW_MS).allowed) {
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
    return { success: false, fieldErrors: parsed.error.flatten().fieldErrors }
  }
  const d = parsed.data

  const supabase = createServiceClient()

  // A removal takes a listing off the public site, and the listing's UUID is
  // printed on its own public card — so anyone can file one in a competitor's
  // name. Nothing here is actionable until the address already on file for the
  // listing confirms it. Claims and corrections are reviewed by hand and carry
  // no such risk, so they skip the loop.
  let verificationStatus: 'not_required' | 'pending' | 'unverifiable' = 'not_required'
  let verifyToken: string | null = null
  let verifySentTo: string | null = null

  if (d.kind === 'remove') {
    verificationStatus = 'unverifiable'
    if (d.rater_id) {
      const { data: rater } = await supabase
        .from('raters')
        .select('email, business_name')
        .eq('id', d.rater_id)
        .single()

      if (rater?.email) {
        verificationStatus = 'pending'
        verifyToken = randomBytes(32).toString('hex')
        verifySentTo = rater.email
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
    verify_token: verifyToken,
    verify_sent_to: verifySentTo,
  })

  // supabase/003_request_verification.sql adds those three columns. If the code
  // ships before the migration is run, save the request anyway rather than
  // losing it — but skip the confirmation email, since nothing would record it.
  if (error && /column|schema cache/i.test(error.message)) {
    console.error('listing_requests: verification columns missing — run supabase/003_request_verification.sql')
    verifyToken = null
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

    // Confirmation request to the address on file for the listing.
    if (verifyToken && verifySentTo) {
      const link = `${SITE_URL}/claim/verify?token=${verifyToken}`
      try {
        await resend.emails.send({
          from: MAIL_FROM,
          to: verifySentTo,
          subject: `Confirm removal of ${d.business_name || 'your listing'} from Title 24 Directory`,
          html: `
            <p style="font-family:sans-serif;font-size:15px">Someone asked us to remove this listing from the Title 24 Directory:</p>
            <p style="font-family:sans-serif;font-size:15px"><strong>${e.business_name || '(listing)'}</strong></p>
            <p style="font-family:sans-serif;font-size:15px">We only act on removals confirmed from this address, which is the one on file for the listing. If this was you, confirm below and we&rsquo;ll take it down.</p>
            <p style="font-family:sans-serif;font-size:15px">
              <a href="${escapeHtml(link)}" style="display:inline-block;background:#1d4ed8;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600">Confirm removal</a>
            </p>
            <p style="font-family:sans-serif;font-size:13px;color:#6b7280">If you didn&rsquo;t ask for this, ignore this email — nothing will change. Requested by ${e.contact_name} (${e.email}).</p>`,
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
          ? 'UNVERIFIED — no listing on file to confirm against. Check by hand before actioning.'
          : 'Reviewed by hand — no verification required for this request type.'

    try {
      await resend.emails.send({
        from: MAIL_FROM,
        to: NOTIFY_TO,
        subject: `[${LABEL[d.kind]}] ${d.business_name || d.contact_name}`,
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

/** Called from the confirmation link's page. Marks one removal request verified. */
export async function confirmRemoval(token: string): Promise<{ ok: boolean; businessName?: string }> {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return { ok: false }

  const supabase = createServiceClient()
  const { data: request } = await supabase
    .from('listing_requests')
    .select('id, business_name, verification_status')
    .eq('verify_token', token)
    .single()

  if (!request) return { ok: false }
  if (request.verification_status === 'verified') {
    return { ok: true, businessName: request.business_name ?? undefined }
  }

  const { error } = await supabase
    .from('listing_requests')
    .update({
      verification_status: 'verified',
      verified_at: new Date().toISOString(),
      verify_token: null, // single use
    })
    .eq('id', request.id)

  if (error) {
    console.error('removal confirmation failed:', error.message)
    return { ok: false }
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: MAIL_FROM,
        to: NOTIFY_TO,
        subject: `[Removal confirmed] ${request.business_name || 'listing'}`,
        html: `<p style="font-family:sans-serif;font-size:14px">The address on file confirmed the removal of <strong>${escapeHtml(request.business_name)}</strong>. This one is safe to action.</p>
               <p style="font-family:sans-serif;font-size:14px"><a href="${SITE_URL}/admin">Open the admin panel</a></p>`,
      })
    } catch (err) {
      console.error('removal confirmation notification failed:', err)
    }
  }

  return { ok: true, businessName: request.business_name ?? undefined }
}
