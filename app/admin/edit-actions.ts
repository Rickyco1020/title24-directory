'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createServiceClient, type Rater } from '@/lib/supabase'
import { isAuthenticated, updateRaterStatus } from './actions'
import { isHttpUrl } from '@/lib/security'
import { CATEGORIES, displayServices } from '@/lib/categories'
import { CA_COUNTIES, CITIES, cityName } from '@/lib/california-data'
import { parseCitiesServed } from '@/lib/cities-served'
import {
  EDITABLE_FIELDS,
  descriptionLimit,
  snapshotEditable,
  type EditState,
  type EditableSnapshot,
} from '@/lib/admin-edit'

const optionalText = (max: number, label = `Max ${max} characters`) =>
  z.string().trim().max(max, label).optional().or(z.literal(''))

function emptyToNull(value: string | undefined): string | null {
  const v = (value ?? '').trim()
  return v ? v : null
}

/**
 * Turn the cities textarea back into slugs.
 *
 * The form shows stored slugs as display names ("irvine" -> "Irvine"). Entries
 * that still match the display name of a slug the listing already had keep that
 * exact slug, so an untouched cities box round-trips unchanged — routing them
 * through the free-text parser would drop any city that shares its name with a
 * county ("Los Angeles", "San Diego") and could re-slug unlisted ones. Anything
 * new or changed goes through the same parser as the Get Listed form.
 */
function citiesFromForm(raw: string, existing: string[]): string[] {
  const byName = new Map(existing.map(slug => [cityName(slug).toLowerCase(), slug]))
  const out: string[] = []
  for (const part of raw.split(/[,;\n]/)) {
    const trimmed = part.trim()
    if (!trimmed) continue
    const kept = byName.get(trimmed.toLowerCase())
    const slugs = kept ? [kept] : parseCitiesServed(trimmed)
    for (const slug of slugs) if (!out.includes(slug)) out.push(slug)
  }
  return out.slice(0, 60)
}

function sameList(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i])
}

/**
 * Fields whose value actually changed. Compared after the same normalisation
 * the form applies (trimmed, blank = null, retired service aliases collapsed),
 * so opening a listing and saving it untouched records no edit.
 */
function changedFields(before: EditableSnapshot, after: EditableSnapshot): string[] {
  const norm = (v: string | null) => (v ?? '').trim() || null
  return EDITABLE_FIELDS.filter(field => {
    if (field === 'services') return !sameList(displayServices(before.services), after.services)
    const x = before[field]
    const y = after[field]
    if (Array.isArray(x) || Array.isArray(y)) return !sameList((x as string[]) ?? [], (y as string[]) ?? [])
    return norm(x as string | null) !== norm(y as string | null)
  })
}

/**
 * Refresh the public pages a listing appears on. City, county and rater pages
 * are ISR with a one-day window; without this an edit would sit invisible for
 * up to 24 hours. Scoped to the counties and cities the listing touches (before
 * and after the edit) rather than the whole site, so one edit costs a handful of
 * ISR writes, not ~550.
 */
function revalidateListing(id: string, ...rows: EditableSnapshot[]) {
  revalidatePath(`/directory/rater/${id}`)
  revalidatePath('/directory')
  revalidatePath('/')
  const counties = new Set<string>()
  const cities = new Set<string>()
  for (const row of rows) {
    for (const c of row.counties_served ?? []) counties.add(c)
    for (const c of row.cities_served ?? []) cities.add(c)
  }
  for (const county of counties) {
    revalidatePath(`/directory/county/${county}`)
    for (const city of CITIES) if (city.county_slug === county) cities.add(city.slug)
  }
  for (const city of cities) revalidatePath(`/directory/${city}`)
}

/**
 * Save an admin edit to a listing — pending, approved or featured.
 *
 * `intent` is "save" (status untouched) or "approve" ("Save & Approve", pending
 * listings only: saves, then approves exactly as the dashboard's Approve does).
 * Never changes id, created_at, source, or the featured flag.
 */
export async function saveListingEdit(_prev: EditState, formData: FormData): Promise<EditState> {
  // Same gate as updateRaterStatus. This is a 'use server' export, so it is a
  // public endpoint: a replayed request without the session cookie must write
  // nothing.
  if (!(await isAuthenticated())) {
    return { error: 'Not authorised. Log in to the admin panel again.' }
  }

  const id = String(formData.get('id') ?? '')
  const intent = formData.get('intent') === 'approve' ? 'approve' : 'save'
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: 'Unknown listing.' }

  const supabase = createServiceClient()
  const { data: current, error: readError } = await supabase.from('raters').select('*').eq('id', id).single()
  if (readError || !current) return { error: 'That listing no longer exists.' }
  const rater = current as Rater

  if (intent === 'approve' && rater.status !== 'pending') {
    return { error: 'Only a pending listing can be approved from here.' }
  }

  const before = snapshotEditable(rater)

  // Values the form may submit: the current categories and counties, plus
  // anything already stored on this row (so a legacy value can be kept, but no
  // new ones invented).
  const allowedServices = new Set<string>([...CATEGORIES.map(c => c.value), ...before.services])
  const allowedCounties = new Set<string>([...CA_COUNTIES.map(c => c.slug), ...before.counties_served])
  const limit = descriptionLimit(rater.description)

  const schema = z.object({
    business_name: z.string().trim().min(2, 'Business name is required').max(200, 'Max 200 characters'),
    contact_name: z.string().trim().min(2, 'Contact name is required').max(120, 'Max 120 characters'),
    email: z.string().trim().email('Valid email is required').max(200, 'Max 200 characters'),
    phone: optionalText(40),
    website: z
      .string()
      .trim()
      .max(500, 'Max 500 characters')
      .refine(v => v === '' || isHttpUrl(v), 'Must be a valid http(s) URL or a bare domain')
      .optional(),
    license_number: optionalText(100),
    services: z
      .array(z.string())
      .min(1, 'Select at least one service')
      .refine(list => list.every(s => allowedServices.has(s)), 'Unknown service value'),
    counties_served: z
      .array(z.string())
      .min(1, 'Select at least one county')
      .refine(list => list.every(c => allowedCounties.has(c)), 'Unknown county'),
    cities_served: optionalText(1000),
    description: optionalText(limit, `Max ${limit} characters`),
  })

  const parsed = schema.safeParse({
    business_name: formData.get('business_name') ?? '',
    contact_name: formData.get('contact_name') ?? '',
    email: formData.get('email') ?? '',
    phone: formData.get('phone') ?? '',
    website: formData.get('website') ?? '',
    license_number: formData.get('license_number') ?? '',
    services: displayServices(formData.getAll('services').map(String)),
    counties_served: [...new Set(formData.getAll('counties_served').map(String))],
    cities_served: formData.get('cities_served') ?? '',
    description: formData.get('description') ?? '',
  })
  if (!parsed.success) {
    return { error: 'Fix the highlighted fields.', fieldErrors: parsed.error.flatten().fieldErrors }
  }
  const d = parsed.data

  const after: EditableSnapshot = {
    business_name: d.business_name,
    contact_name: d.contact_name,
    email: d.email,
    phone: emptyToNull(d.phone),
    website: emptyToNull(d.website),
    license_number: emptyToNull(d.license_number),
    services: d.services,
    // Keep county order stable against what was stored, new ones appended in
    // form order, so an untouched list is not reported as a change.
    counties_served: [
      ...before.counties_served.filter(c => d.counties_served.includes(c)),
      ...d.counties_served.filter(c => !before.counties_served.includes(c)),
    ],
    cities_served: citiesFromForm(d.cities_served ?? '', before.cities_served),
    description: emptyToNull(d.description),
  }

  const changes = changedFields(before, after)

  if (changes.length > 0) {
    const now = new Date().toISOString()

    // Preserve the as-submitted values BEFORE touching the listing. The insert
    // ignores a conflict, so the row written on the first edit is never
    // overwritten. If this fails (most likely migration 006 not run yet), stop:
    // an edit that loses the original is worse than no edit.
    const { error: keepError } = await supabase
      .from('rater_admin_edits')
      .upsert({ rater_id: id, original: before, first_edited_at: now, last_edited_at: now, edit_count: 0 }, {
        onConflict: 'rater_id',
        ignoreDuplicates: true,
      })
    if (keepError) {
      console.error('admin edit: could not preserve original', keepError)
      return {
        error:
          'Could not save the original values, so nothing was changed. Has supabase/006_admin_edits.sql been run?',
      }
    }

    // Only the editable fields — status, id, created_at, source and the
    // featured flag are deliberately not in this object.
    const { error: updateError } = await supabase
      .from('raters')
      .update({ ...after, admin_edited_at: now })
      .eq('id', id)
    if (updateError) {
      console.error('admin edit: update failed', updateError)
      return { error: 'Saving failed. Nothing was changed.' }
    }

    const { data: audit } = await supabase.from('rater_admin_edits').select('edit_count').eq('rater_id', id).single()
    await supabase
      .from('rater_admin_edits')
      .update({ last_edited_at: now, edit_count: ((audit?.edit_count as number | undefined) ?? 0) + 1 })
      .eq('rater_id', id)
  }

  if (intent === 'approve') {
    // The dashboard's own Approve path, unchanged.
    await updateRaterStatus(id, 'approved')
  }

  revalidateListing(id, before, after)
  revalidatePath('/admin')
  revalidatePath(`/admin/edit/${id}`)

  if (intent === 'approve') {
    redirect(`/admin?approved=${encodeURIComponent(id)}`)
  }
  redirect(`/admin/edit/${id}?saved=${changes.length > 0 ? '1' : '0'}`)
}
