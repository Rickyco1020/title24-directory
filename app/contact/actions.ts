'use server'
import { z } from 'zod'
import { Resend } from 'resend'
import { escapeHtml } from '@/lib/security'
import { clientIp, honeypotTripped, rateLimit } from '@/lib/rate-limit'

const schema = z.object({
  name: z.string().min(2, 'Name is required').max(120, 'Max 120 characters'),
  email: z.string().email('Valid email is required').max(200, 'Max 200 characters'),
  subject: z.string().min(1, 'Please select a subject').max(200, 'Max 200 characters'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(4000, 'Max 4000 characters'),
})

// The contact form sends two emails per hit and is unauthenticated, so it gets
// the same treatment as the other public forms.
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60 * 60 * 1000

export type ContactFormState = { success: boolean; error?: string; fieldErrors?: Record<string, string[]> }

export async function submitContactForm(prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
  if (honeypotTripped(formData)) return { success: true }

  const ip = await clientIp()
  if (!rateLimit(`contact:${ip}`, RATE_LIMIT, RATE_WINDOW_MS).allowed) {
    return {
      success: false,
      error: 'Too many messages from this connection. Please try again later.',
    }
  }

  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    subject: formData.get('subject') as string,
    message: formData.get('message') as string,
  }

  const result = schema.safeParse(raw)
  if (!result.success) {
    return { success: false, fieldErrors: result.error.flatten().fieldErrors }
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? 'rickydcc137@gmail.com'

  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    // Sender-controlled text goes into HTML template literals below — escape it.
    const e = {
      name: escapeHtml(result.data.name),
      email: escapeHtml(result.data.email),
      subject: escapeHtml(result.data.subject),
      message: escapeHtml(result.data.message),
    }

    // Send the contact form message to admin
    try {
      await resend.emails.send({
        from: 'Title24 Directory <noreply@title24directory.com>',
        to: adminEmail,
        replyTo: result.data.email,
        subject: `Contact form: ${result.data.subject}`,
        html: `<!DOCTYPE html>
  <html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
    <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="background: #1d4ed8; padding: 24px 32px;">
        <h1 style="color: white; margin: 0; font-size: 20px;">📬 New Contact Form Message</h1>
      </div>
      <div style="padding: 32px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #6b7280; width: 100px;">From</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">${e.name}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0; color: #1d4ed8;">${e.email}</td></tr>
          <tr><td style="padding: 8px 0; color: #6b7280;">Subject</td><td style="padding: 8px 0; color: #111827;">${e.subject}</td></tr>
        </table>
        <div style="margin-top: 20px; padding: 16px; background: #f9fafb; border-radius: 10px; border: 1px solid #e5e7eb;">
          <p style="margin: 0; color: #374151; line-height: 1.6; white-space: pre-wrap;">${e.message}</p>
        </div>
        <p style="margin-top: 20px; color: #6b7280; font-size: 13px;">Reply directly to this email to respond to ${e.name} at ${e.email}.</p>
      </div>
    </div>
  </body>
  </html>`,
      })
    } catch (err) {
      console.error('contact admin email failed:', err)
    }

    // Auto-confirmation to the sender
    try {
      await resend.emails.send({
        from: 'Title24 Directory <noreply@title24directory.com>',
        to: result.data.email,
        subject: 'We received your message — Title24 Directory',
        html: `<!DOCTYPE html>
  <html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f9fafb; margin: 0; padding: 40px 20px;">
    <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(135deg, #1d4ed8, #1e3a8a); padding: 32px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Title24 Directory</h1>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #111827; margin: 0 0 16px;">Message Received</h2>
        <p style="color: #374151; line-height: 1.6;">Hi ${e.name},</p>
        <p style="color: #374151; line-height: 1.6;">Thanks for reaching out. We've received your message and will get back to you within 1–2 business days.</p>
        <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0; color: #0369a1; font-size: 14px;"><strong>Your message</strong><br>
          Subject: ${e.subject}</p>
        </div>
        <p style="color: #374151;">— The Title24 Directory Team</p>
      </div>
    </div>
  </body>
  </html>`,
      })
    } catch (err) {
      console.error('contact confirmation email failed:', err)
    }
  }

  return { success: true }
}
