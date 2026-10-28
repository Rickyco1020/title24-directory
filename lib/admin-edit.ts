/**
 * Shared shapes for the admin listing editor. Free of server-only imports so
 * the client form can use the same field list and description limit as the
 * server action.
 */
import type { Rater } from '@/lib/supabase'

export const EDITABLE_FIELDS = [
  'business_name',
  'contact_name',
  'email',
  'phone',
  'website',
  'license_number',
  'services',
  'counties_served',
  'cities_served',
  'description',
] as const

export type EditableField = (typeof EDITABLE_FIELDS)[number]

export type EditableSnapshot = {
  business_name: string
  contact_name: string | null
  email: string
  phone: string | null
  website: string | null
  license_number: string | null
  services: string[]
  counties_served: string[]
  cities_served: string[]
  description: string | null
}

export const FIELD_LABELS: Record<EditableField, string> = {
  business_name: 'Business name',
  contact_name: 'Contact name',
  email: 'Email',
  phone: 'Phone',
  website: 'Website',
  license_number: 'License / certification',
  services: 'Services',
  counties_served: 'Counties served',
  cities_served: 'Cities served',
  description: 'Description',
}

export type EditState = { error?: string; fieldErrors?: Record<string, string[] | undefined> }

/** The editable fields of a stored row, exactly as stored. */
export function snapshotEditable(rater: Rater): EditableSnapshot {
  return {
    business_name: rater.business_name,
    contact_name: rater.contact_name ?? null,
    email: rater.email,
    phone: rater.phone ?? null,
    website: rater.website ?? null,
    license_number: rater.license_number ?? null,
    services: [...(rater.services ?? [])],
    counties_served: [...(rater.counties_served ?? [])],
    cities_served: [...(rater.cities_served ?? [])],
    description: rater.description ?? null,
  }
}

/**
 * The public Get Listed form caps descriptions at 500 characters, and the
 * column is plain TEXT (no limit of its own), so 500 is the rule. The one
 * exception: a listing already stored with a longer description (a seeded row,
 * say) may keep its current length — it can be trimmed, not grown — so opening
 * and saving an old listing never fails on text nobody touched.
 */
export const DESCRIPTION_LIMIT = 500

export function descriptionLimit(current: string | null | undefined): number {
  return Math.max(DESCRIPTION_LIMIT, current?.length ?? 0)
}
