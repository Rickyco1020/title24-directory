'use server'
import { createServiceClient } from '@/lib/supabase'
import { z } from 'zod'
import { Resend } from 'resend'

const schema = z.object({
  business_name: z.string().min(2, 'Business name is required'),
  contact_name: z.string().min(2, 'Contact name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  services: z.array(z.string()).min(1, 'Select at least one service'),
  counties_served: z.array(z.string()).min(1, 'Select at least one county'),
  cities_served: z.string().optional(),
  license_number: z.string().optional(),
  description: z.string().max(500, 'Max 500 characters').optional(),
})

export type FormState = { success: boolean; error?: string; fieldErrors?: Record<string, string[]> }

export async function submitListing(prevState: FormState, formData: FormData): Promise<FormState> {
  const raw = {
    business_name: formData.get('business_name') as string,
    contact_name: formData.get('contact_name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    website: formData.get('website') as string,
    services: formData.getAll('services') as string[],
    counties_served: formData.getAll('counties_served') as string[],
    cities_served: formData.get('cities_served') as string,
    license_number: formData.get('license_number') as string,
    description: formData.get('description') as string,
  }

  const result = schema.safeParse(raw)
  if (!result.success) {
    return { success: false, fieldErrors: result.error.flatten().fieldErrors }
  }

  const supabase = createServiceClient()
  const { error } = await supabase.from('raters').insert({
    ...result.data,
    cities_served: result.data.cities_served ? result.data.cities_served.split(',').map(s => s.trim()).filter(Boolean) : [],
    status: 'pending',
  })

  if (error) return { success: false, error: 'Submission failed. Please try again.' }

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)

    // Confirmation email to the rater
    await resend.emails.send({
      from: 'Title24 Directory <noreply@title24directory.com>',
      to: result.data.email,
      subject: 'Your Title 24 Directory listing is under review',
      html: `<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #1d4ed8, #1e3a8a); padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Title24 Directory</h1>
      <p style="color: #bfdbfe; margin: 8px 0 0;">California's HERS & ECC Rater Directory</p>
    </div>
    <div style="padding: 32px;">
      <h2 style="color: #111827; margin: 0 0 16px;">Listing Received ✅</h2>
      <p style="color: #374151; line-height: 1.6;">Hi ${result.data.contact_name},</p>
      <p style="color: #374151; line-height: 1.6;">We've received your listing for <strong>${result.data.business_name}</strong> and will review it within 1–2 business days.</p>
      <p style="color: #374151; line-height: 1.6;">Once approved, your listing will appear in our directory and across relevant California city and county search pages on <a href="https://title24directory.com" style="color: #1d4ed8;">title24directory.com</a>.</p>
      <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 16px; margin: 24px 0;">
        <p style="margin: 0; color: #0369a1; font-size: 14px;"><strong>Listing summary</strong><br>
        Business: ${result.data.business_name}<br>
        Services: ${result.data.services.join(', ')}<br>
        Counties: ${result.data.counties_served.join(', ')}</p>
      </div>
      <p style="color: #6b7280; font-size: 14px;">Questions? Reply to this email and we'll get back to you.</p>
      <p style="color: #374151;">— The Title24 Directory Team</p>
    </div>
  </div>
</body>
</html>`,
    })

    // Admin notification email
    const adminEmail = process.env.ADMIN_EMAIL ?? 'rickydcc137@gmail.com'
    await resend.emails.send({
      from: 'Title24 Directory <noreply@title24directory.com>',
      to: adminEmail,
      subject: `New listing submission: ${result.data.business_name}`,
      html: `<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: #f59e0b; padding: 24px 32px;">
      <h1 style="color: white; margin: 0; font-size: 20px;">🔔 New Listing Submitted</h1>
    </div>
    <div style="padding: 32px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding: 8px 0; color: #6b7280; width: 140px;">Business</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">${result.data.business_name}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Contact</td><td style="padding: 8px 0; color: #111827;">${result.data.contact_name}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0; color: #1d4ed8;">${result.data.email}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Phone</td><td style="padding: 8px 0; color: #111827;">${result.data.phone || '—'}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Website</td><td style="padding: 8px 0; color: #1d4ed8;">${result.data.website || '—'}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Services</td><td style="padding: 8px 0; color: #111827;">${result.data.services.join(', ')}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Counties</td><td style="padding: 8px 0; color: #111827;">${result.data.counties_served.join(', ')}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">License</td><td style="padding: 8px 0; color: #111827;">${result.data.license_number || '—'}</td></tr>
        ${result.data.description ? `<tr><td style="padding: 8px 0; color: #6b7280; vertical-align: top;">Description</td><td style="padding: 8px 0; color: #111827;">${result.data.description}</td></tr>` : ''}
      </table>
      <div style="margin-top: 24px;">
        <a href="https://title24directory.com/admin" style="display: inline-block; background: #1d4ed8; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Review in Admin Panel →</a>
      </div>
    </div>
  </div>
</body>
</html>`,
    })
  }

  return { success: true }
}
