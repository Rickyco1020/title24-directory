'use server'
import { createServiceClient } from '@/lib/supabase'
import { z } from 'zod'
import { Resend } from 'resend'
import { escapeHtml, isHttpUrl } from '@/lib/security'
import { displayServices } from '@/lib/categories'
import { clientIp, headerSafe, honeypotTripped, rateLimit, rateLimitExceeded } from '@/lib/rate-limit'
import { ADMIN_EMAIL, absoluteUrl } from '@/lib/site'
import { resolvePlace } from '@/lib/place-match'
import { slugify } from '@/lib/california-data'

// The cities box is free text but the search matches cities_served against
// slugs ('irvine'). Without normalising here, a rater who types "Irvine" or
// "Irvine, CA" is invisible to city search while one who types "irvine" is
// found — so everything gets resolved to a slug on the way in.
//
// Unrecognised entries are kept, slugified, rather than dropped: plenty of
// small California cities are legitimate even when they are not in our list,
// and silently discarding a rater's service area would be worse than storing
// it in a consistent shape. County names are skipped — counties have their own
// checkboxes and would otherwise land in the wrong column.

// What is left over when someone writes 'Irvine, CA' and the list is split on
// commas. On its own it names no place; without this check the state name was
// stored as a city slug — a live test submission produced ["irvine","ca",...].
const STATE_TAILS = new Set(['ca', 'cal', 'calif', 'california', 'usa', 'us', 'united states'])

function parseCitiesServed(raw?: string): string[] {
  if (!raw) return []
  const out: string[] = []
  // Commas, semicolons and newlines are all things people separate lists with.
  for (const part of raw.split(/[,;\n]/)) {
    const trimmed = part.trim()
    if (!trimmed || STATE_TAILS.has(trimmed.toLowerCase())) continue
    const resolved = resolvePlace(trimmed)
    if (resolved?.kind === 'county') continue
    const slug = resolved?.kind === 'city' ? resolved.citySlug : slugify(trimmed)
    if (slug && !out.includes(slug)) out.push(slug)
  }
  return out.slice(0, 60)
}

const schema = z.object({
  business_name: z.string().min(2, 'Business name is required').max(200, 'Max 200 characters'),
  contact_name: z.string().min(2, 'Contact name is required').max(120, 'Max 120 characters'),
  email: z.string().email('Valid email is required').max(200, 'Max 200 characters'),
  phone: z.string().max(40, 'Max 40 characters').optional(),
  website: z
    .string()
    .max(500, 'Max 500 characters')
    .refine(isHttpUrl, 'Must be a valid http:// or https:// URL')
    .optional()
    .or(z.literal('')),
  services: z.array(z.string().max(60)).min(1, 'Select at least one service').max(10, 'Too many services'),
  counties_served: z
    .array(z.string().max(60))
    .min(1, 'Select at least one county')
    .max(58, 'Too many counties'),
  cities_served: z.string().max(1000, 'Max 1000 characters').optional(),
  license_number: z.string().max(100, 'Max 100 characters').optional(),
  description: z.string().max(500, 'Max 500 characters').optional(),
})

export type FormState = { success: boolean; error?: string; fieldErrors?: Record<string, string[]> }

// One IP may submit 3 listings an hour. Real raters submit once.
const RATE_LIMIT = 3
const RATE_WINDOW_MS = 60 * 60 * 1000

export async function submitListing(prevState: FormState, formData: FormData): Promise<FormState> {
  const ip = await clientIp()

  // Bots that fill every field trip the hidden input. Report success so they
  // learn nothing, but write nothing and send nothing — and log it, so a false
  // positive shows up somewhere instead of vanishing.
  if (honeypotTripped(formData)) {
    console.warn('get-listed: honeypot tripped', { ip, business: formData.get('business_name') })
    return { success: true }
  }

  const key = `get-listed:${ip}`
  if (rateLimitExceeded(key, RATE_LIMIT)) {
    return {
      success: false,
      error: 'Too many submissions from this connection. Please try again later, or email us directly.',
    }
  }

  const raw = {
    business_name: formData.get('business_name') as string,
    contact_name: formData.get('contact_name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    website: formData.get('website') as string,
    // Collapse retired category values ('ecc' -> 'hers') so nothing new is
    // written under a name the directory no longer offers. The form only shows
    // current categories; this covers a hand-crafted POST.
    services: displayServices(formData.getAll('services') as string[]),
    counties_served: formData.getAll('counties_served') as string[],
    cities_served: formData.get('cities_served') as string,
    license_number: formData.get('license_number') as string,
    description: formData.get('description') as string,
  }

  const result = schema.safeParse(raw)
  if (!result.success) {
    // Deliberately before the quota is consumed: a rater who mistypes their
    // email twice should not be locked out of a free signup form for an hour.
    return { success: false, fieldErrors: result.error.flatten().fieldErrors }
  }

  rateLimit(key, RATE_LIMIT, RATE_WINDOW_MS)

  const supabase = createServiceClient()

  // Duplicate guard, not a flood defence — the submitter picks the email, so
  // one character of variation resets it. It exists to stop the same rater
  // filing the same listing five times while it sits in the queue.
  const { count: recentCount } = await supabase
    .from('raters')
    .select('id', { count: 'exact', head: true })
    .eq('email', result.data.email)
    .eq('status', 'pending')

  if ((recentCount ?? 0) >= 3) {
    return {
      success: false,
      error: 'You already have listings awaiting review under this email. We will be in touch shortly.',
    }
  }

  const { error } = await supabase.from('raters').insert({
    ...result.data,
    cities_served: parseCitiesServed(result.data.cities_served),
    status: 'pending',
  })

  if (error) return { success: false, error: 'Submission failed. Please try again.' }

  // The row is saved. Email is a side effect and must never fail the request —
  // a rejected action here shows the rater an error and invites a duplicate
  // submission for a row that already exists.
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const d = result.data
    // Every interpolated value below is attacker-controlled, so escape it.
    const e = {
      business_name: escapeHtml(d.business_name),
      contact_name: escapeHtml(d.contact_name),
      email: escapeHtml(d.email),
      phone: escapeHtml(d.phone),
      website: escapeHtml(d.website),
      license_number: escapeHtml(d.license_number),
      description: escapeHtml(d.description),
      services: escapeHtml(d.services.join(', ')),
      counties: escapeHtml(d.counties_served.join(', ')),
    }

    // Confirmation email to the rater
    try {
      await resend.emails.send({
        from: 'Title24 Directory <noreply@title24directory.com>',
        to: d.email,
        subject: 'Your Title 24 Directory listing is under review',
        html: `<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #1d4ed8, #1e3a8a); padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Title24 Directory</h1>
      <p style="color: #bfdbfe; margin: 8px 0 0;">California's HERS &amp; ECC Rater Directory</p>
    </div>
    <div style="padding: 32px;">
      <h2 style="color: #111827; margin: 0 0 16px;">Listing Received ✅</h2>
      <p style="color: #374151; line-height: 1.6;">Hi ${e.contact_name},</p>
      <p style="color: #374151; line-height: 1.6;">We've received your listing for <strong>${e.business_name}</strong> and will review it within 1–2 business days.</p>
      <p style="color: #374151; line-height: 1.6;">Once approved, your listing will appear in our directory and across relevant California city and county search pages on <a href="${absoluteUrl('/')}" style="color: #1d4ed8;">title24directory.com</a>.</p>
      <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 16px; margin: 24px 0;">
        <p style="margin: 0; color: #0369a1; font-size: 14px;"><strong>Listing summary</strong><br>
        Business: ${e.business_name}<br>
        Services: ${e.services}<br>
        Counties: ${e.counties}</p>
      </div>
      <p style="color: #6b7280; font-size: 14px;">Questions? Reply to this email and we'll get back to you.</p>
      <p style="color: #374151;">— The Title24 Directory Team</p>
    </div>
  </div>
</body>
</html>`,
      })
    } catch (err) {
      console.error('get-listed confirmation email failed:', err)
    }

    // Admin notification email
    try {
      await resend.emails.send({
        from: 'Title24 Directory <noreply@title24directory.com>',
        to: ADMIN_EMAIL,
        subject: headerSafe(`New listing submission: ${d.business_name}`),
        html: `<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: #f59e0b; padding: 24px 32px;">
      <h1 style="color: white; margin: 0; font-size: 20px;">🔔 New Listing Submitted</h1>
    </div>
    <div style="padding: 32px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding: 8px 0; color: #6b7280; width: 140px;">Business</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">${e.business_name}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Contact</td><td style="padding: 8px 0; color: #111827;">${e.contact_name}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0; color: #1d4ed8;">${e.email}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Phone</td><td style="padding: 8px 0; color: #111827;">${e.phone || '—'}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Website</td><td style="padding: 8px 0; color: #1d4ed8;">${e.website || '—'}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Services</td><td style="padding: 8px 0; color: #111827;">${e.services}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Counties</td><td style="padding: 8px 0; color: #111827;">${e.counties}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">License</td><td style="padding: 8px 0; color: #111827;">${e.license_number || '—'}</td></tr>
        ${e.description ? `<tr><td style="padding: 8px 0; color: #6b7280; vertical-align: top;">Description</td><td style="padding: 8px 0; color: #111827;">${e.description}</td></tr>` : ''}
      </table>
      <div style="margin-top: 24px;">
        <a href="${absoluteUrl('/admin')}" style="display: inline-block; background: #1d4ed8; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Review in Admin Panel →</a>
      </div>
    </div>
  </div>
</body>
</html>`,
      })
    } catch (err) {
      console.error('get-listed admin notification email failed:', err)
    }
  }

  return { success: true }
}
