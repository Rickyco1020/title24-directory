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
    await resend.emails.send({
      from: 'Title24 Directory <noreply@title24directory.com>',
      to: result.data.email,
      subject: 'Your Title 24 Directory listing is under review',
      html: `<h2>Thanks for submitting, ${result.data.contact_name}!</h2>
      <p>We've received your listing for <strong>${result.data.business_name}</strong> and will review it within 1–2 business days.</p>
      <p>Once approved, your listing will appear across relevant California city and county pages on Title24Directory.com.</p>
      <p>If you have questions, reply to this email.</p>
      <p>— The Title24 Directory Team</p>`,
    })
  }

  return { success: true }
}
