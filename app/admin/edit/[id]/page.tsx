import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createServiceClient, type Rater } from '@/lib/supabase'
import { isAuthenticated } from '../../actions'
import { CATEGORIES, CATEGORY_LABELS, displayServices } from '@/lib/categories'
import { CA_COUNTIES, cityName, countyName } from '@/lib/california-data'
import {
  EDITABLE_FIELDS,
  FIELD_LABELS,
  descriptionLimit,
  type EditableField,
  type EditableSnapshot,
} from '@/lib/admin-edit'
import EditListingForm, { type EditFormInitial, type Option } from './EditListingForm'

export const metadata: Metadata = { title: 'Edit listing' }
export const dynamic = 'force-dynamic'

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function displayValue(field: EditableField, value: EditableSnapshot[EditableField]): string {
  if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) return '—'
  if (field === 'services') return displayServices(value as string[]).map(s => CATEGORY_LABELS[s] ?? s).join(', ')
  if (field === 'counties_served') return (value as string[]).map(countyName).join(', ')
  if (field === 'cities_served') return (value as string[]).map(cityName).join(', ')
  return String(value)
}

export default async function EditListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string }>
}) {
  if (!(await isAuthenticated())) redirect('/admin/login')

  const { id } = await params
  const { saved } = await searchParams
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound()

  const supabase = createServiceClient()
  const { data } = await supabase.from('raters').select('*').eq('id', id).single()
  if (!data) notFound()
  const rater = data as Rater & { admin_edited_at?: string | null }

  // The preserved as-submitted values. Missing until the first edit — and the
  // whole table is missing until migration 006 runs, which reads the same way.
  const { data: audit } = await supabase
    .from('rater_admin_edits')
    .select('original, first_edited_at, last_edited_at')
    .eq('rater_id', id)
    .maybeSingle()
  const original = (audit?.original ?? null) as EditableSnapshot | null

  // Checkbox options: the current categories/counties, plus any legacy value
  // already stored on this row so it can be kept or unticked, never lost.
  const services = displayServices(rater.services)
  const serviceOptions: Option[] = CATEGORIES.map(c => ({ value: c.value, label: c.label }))
  for (const s of services) {
    if (!serviceOptions.some(o => o.value === s)) serviceOptions.push({ value: s, label: CATEGORY_LABELS[s] ?? s })
  }
  const countyOptions: Option[] = CA_COUNTIES.map(c => ({ value: c.slug, label: c.name }))
  for (const c of rater.counties_served ?? []) {
    if (!countyOptions.some(o => o.value === c)) countyOptions.push({ value: c, label: `${c} (stored value)` })
  }

  const initial: EditFormInitial = {
    id: rater.id,
    status: rater.status,
    business_name: rater.business_name ?? '',
    contact_name: rater.contact_name ?? '',
    email: rater.email ?? '',
    phone: rater.phone ?? '',
    website: rater.website ?? '',
    license_number: rater.license_number ?? '',
    services,
    counties_served: rater.counties_served ?? [],
    cities_served: (rater.cities_served ?? []).map(cityName).join(', '),
    description: rater.description ?? '',
  }

  const current: EditableSnapshot = {
    business_name: rater.business_name,
    contact_name: rater.contact_name,
    email: rater.email,
    phone: rater.phone,
    website: rater.website,
    license_number: rater.license_number,
    services: rater.services ?? [],
    counties_served: rater.counties_served ?? [],
    cities_served: rater.cities_served ?? [],
    description: rater.description,
  }

  const originalDiffers = (field: EditableField) =>
    original !== null && displayValue(field, original[field]) !== displayValue(field, current[field])
  const otherDiffs = EDITABLE_FIELDS.filter(f => f !== 'description' && originalDiffers(f))

  const editedOn = formatDate(rater.admin_edited_at ?? audit?.last_edited_at ?? null)
  const statusLabel = rater.status.charAt(0).toUpperCase() + rater.status.slice(1)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {/* Plain <a>, not <Link>: a full navigation fires beforeunload, which is
          what warns about unsaved changes. */}
      <a href="/admin" className="text-sm text-gray-500 hover:text-gray-900">
        ← Back to admin
      </a>

      <div className="mt-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Edit listing</h1>
        <p className="text-sm text-gray-500 mt-1">
          <span className="font-semibold">{statusLabel}</span>
          {' · '}Submitted {formatDate(rater.created_at)}
          {rater.status !== 'pending' && (
            <>
              {' · '}
              <a href={`/directory/rater/${rater.id}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                View public page ↗
              </a>
            </>
          )}
        </p>
        {editedOn && <p className="text-xs text-gray-400 mt-1">Edited by admin — {editedOn}</p>}
      </div>

      {saved === '1' && (
        <p role="status" className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Saved. {rater.status === 'pending' ? 'The listing is still pending.' : 'The public page is updated.'}
        </p>
      )}
      {saved === '0' && (
        <p role="status" className="mb-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          No changes to save.
        </p>
      )}

      <EditListingForm
        initial={initial}
        serviceOptions={serviceOptions}
        countyOptions={countyOptions}
        descriptionMax={descriptionLimit(rater.description)}
      />

      {original && (originalDiffers('description') || otherDiffs.length > 0) && (
        <section className="mt-10 border-t border-gray-200 pt-6">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">As submitted</h2>
          <p className="text-xs text-gray-400 mt-1 mb-4">
            Kept from before the first admin edit ({formatDate(audit?.first_edited_at)}). Internal only — never shown publicly.
          </p>
          {originalDiffers('description') && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 mb-1">{FIELD_LABELS.description}</p>
              <p className="whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                {original.description || '(none)'}
              </p>
            </div>
          )}
          {otherDiffs.length > 0 && (
            <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">
              {otherDiffs.map(f => (
                <div key={f} className="contents">
                  <dt className="text-gray-500">{FIELD_LABELS[f]}</dt>
                  <dd className="text-gray-700">{displayValue(f, original[f])}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      )}
    </div>
  )
}
