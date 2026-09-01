import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export type Rater = {
  id: string
  created_at: string
  status: 'pending' | 'approved' | 'featured'
  business_name: string
  contact_name: string | null
  email: string
  phone: string | null
  website: string | null
  services: string[]
  cities_served: string[] | null
  counties_served: string[] | null
  description: string | null
  license_number: string | null
  source?: 'self' | 'seeded'
}

/**
 * A row of `listing_requests` — the claim / correct / remove queue behind the
 * admin panel. `verify_token_hash` is deliberately not modelled: only the claim
 * action ever touches it, and nothing that renders should read it.
 */
export type ListingRequest = {
  id: string
  created_at: string
  rater_id: string | null
  kind: 'claim' | 'correct' | 'remove'
  business_name: string | null
  contact_name: string
  email: string
  phone: string | null
  message: string | null
  handled: boolean
  verification_status: 'not_required' | 'pending' | 'verified' | 'unverifiable'
  verify_sent_to: string | null
  verified_at: string | null
}

export type City = {
  id: number
  name: string
  slug: string
  county: string
  county_slug: string
  lat: number | null
  lng: number | null
  population: number | null
}

export type County = {
  id: number
  name: string
  slug: string
  lat: number | null
  lng: number | null
}
