'use server'
import { createServiceClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createHash, timingSafeEqual } from 'crypto'

// No fallback password. The admin panel lists every submitter's name, email and
// phone number, so a well-known default is the same as no password at all — if
// ADMIN_PASSWORD is missing, login is disabled rather than left wide open.
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? ''
const COOKIE_NAME = 'admin_auth'
// Cookie value is derived from the password — changing the password invalidates all existing sessions
const COOKIE_VALUE = 'auth_' + createHash('sha256').update(ADMIN_PASSWORD).digest('hex').slice(0, 24)

function matchesPassword(candidate: string): boolean {
  if (!ADMIN_PASSWORD) return false
  const a = Buffer.from(createHash('sha256').update(candidate).digest())
  const b = Buffer.from(createHash('sha256').update(ADMIN_PASSWORD).digest())
  return timingSafeEqual(a, b)
}

export async function adminLogin(prevState: { error: string }, formData: FormData): Promise<{ error: string }> {
  if (!ADMIN_PASSWORD) {
    console.error('ADMIN_PASSWORD is not set — admin login is disabled.')
    return { error: 'Admin login is not configured. Set ADMIN_PASSWORD and redeploy.' }
  }

  const password = (formData.get('password') as string) ?? ''
  if (matchesPassword(password)) {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, COOKIE_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    })
    redirect('/admin')
  }
  return { error: 'Incorrect password. Please try again.' }
}

export async function isAuthenticated(): Promise<boolean> {
  if (!ADMIN_PASSWORD) return false
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value === COOKIE_VALUE
}

export async function adminLogout() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  redirect('/admin/login')
}

export async function updateRaterStatus(id: string, status: 'approved' | 'featured' | 'rejected') {
  const supabase = createServiceClient()
  if (status === 'rejected') {
    await supabase.from('raters').delete().eq('id', id)
  } else {
    await supabase.from('raters').update({ status }).eq('id', id)
  }
}
