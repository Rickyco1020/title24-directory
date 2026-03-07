'use server'
import { createServiceClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin123'
const COOKIE_NAME = 'admin_auth'
const COOKIE_VALUE = 'authenticated'

export async function adminLogin(prevState: { error: string }, formData: FormData): Promise<{ error: string }> {
  const password = formData.get('password') as string
  if (password === ADMIN_PASSWORD) {
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
