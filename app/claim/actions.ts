'use server'
import { createServiceClient } from '@/lib/supabase'
import { z } from 'zod'
import { Resend } from 'resend'

const schema = z.object({
  rater_id: z.string().uuid().optional().or(z.literal('')),
  business_name: z.string().max(200).optional(),
  kind: z.enum(['claim', 'correct', 'remove']),
  contact_name: z.string().min(2, 'Your name is required'),
  email: z.string().email('A valid email is required'),
  phone: z.string().max(40).optional(),
  message: z.string().max(2000).optional(),
})

export type ClaimState = {
  success: boolean
  error?: string
  fieldErrors?: Record<string, string[]>
}

const LABEL: Record<string, string> = {
  claim: 'Claim this listing',
  correct: 'Correct the details',
  remove: 'Remove this listing',
}

export async function submitClaim(prev: ClaimState, formData: FormData): Promise<ClaimState> {
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
  const { error } = await supabase.from('listing_requests').insert({
    rater_id: d.rater_id ? d.rater_id : null,
    business_name: d.business_name || null,
    kind: d.kind,
    contact_name: d.contact_name,
    email: d.email,
    phone: d.phone || null,
    message: d.message || null,
  })

  if (error) {
    console.error('listing_requests insert failed:', error.message)
    return { success: false, error: 'Something went wrong saving your request. Please email us instead.' }
  }

  // Notify the site owner. Never block the user's confirmation on email.
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'Title 24 Directory <onboarding@resend.dev>',
        to: 'rickyco1020@gmail.com',
        subject: `[${LABEL[d.kind]}] ${d.business_name || d.contact_name}`,
        html: `
          <h2>${LABEL[d.kind]}</h2>
          <table style="font-family:sans-serif;font-size:14px">
            <tr><td style="padding:6px 12px 6px 0;color:#6b7280">Request</td><td>${LABEL[d.kind]}</td></tr>
            <tr><td style="padding:6px 12px 6px 0;color:#6b7280">Business</td><td>${d.business_name || '—'}</td></tr>
            <tr><td style="padding:6px 12px 6px 0;color:#6b7280">Listing ID</td><td>${d.rater_id || '—'}</td></tr>
            <tr><td style="padding:6px 12px 6px 0;color:#6b7280">Contact</td><td>${d.contact_name}</td></tr>
            <tr><td style="padding:6px 12px 6px 0;color:#6b7280">Email</td><td>${d.email}</td></tr>
            <tr><td style="padding:6px 12px 6px 0;color:#6b7280">Phone</td><td>${d.phone || '—'}</td></tr>
          </table>
          <p style="font-family:sans-serif;font-size:14px;white-space:pre-wrap">${d.message || ''}</p>
          <p style="font-family:sans-serif;font-size:13px;color:#6b7280">
            Removal requests should be honoured promptly.
          </p>`,
      })
    } catch (e) {
      console.error('claim notification email failed:', e)
    }
  }

  return { success: true }
}
