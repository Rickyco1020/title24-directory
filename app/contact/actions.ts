'use server'
import { z } from 'zod'
import { Resend } from 'resend'

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export type ContactFormState = { success: boolean; error?: string; fieldErrors?: Record<string, string[]> }

export async function submitContactForm(prevState: ContactFormState, formData: FormData): Promise<ContactFormState> {
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

    // Send the contact form message to admin
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
        <tr><td style="padding: 8px 0; color: #6b7280; width: 100px;">From</td><td style="padding: 8px 0; color: #111827; font-weight: 600;">${result.data.name}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Email</td><td style="padding: 8px 0; color: #1d4ed8;">${result.data.email}</td></tr>
        <tr><td style="padding: 8px 0; color: #6b7280;">Subject</td><td style="padding: 8px 0; color: #111827;">${result.data.subject}</td></tr>
      </table>
      <div style="margin-top: 20px; padding: 16px; background: #f9fafb; border-radius: 10px; border: 1px solid #e5e7eb;">
        <p style="margin: 0; color: #374151; line-height: 1.6; white-space: pre-wrap;">${result.data.message}</p>
      </div>
      <p style="margin-top: 20px; color: #6b7280; font-size: 13px;">Reply directly to this email to respond to ${result.data.name} at ${result.data.email}.</p>
    </div>
  </div>
</body>
</html>`,
    })

    // Auto-confirmation to the sender
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
      <p style="color: #374151; line-height: 1.6;">Hi ${result.data.name},</p>
      <p style="color: #374151; line-height: 1.6;">Thanks for reaching out. We've received your message and will get back to you within 1–2 business days.</p>
      <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 16px; margin: 24px 0;">
        <p style="margin: 0; color: #0369a1; font-size: 14px;"><strong>Your message</strong><br>
        Subject: ${result.data.subject}</p>
      </div>
      <p style="color: #374151;">— The Title24 Directory Team</p>
    </div>
  </div>
</body>
</html>`,
    })
  }

  return { success: true }
}
