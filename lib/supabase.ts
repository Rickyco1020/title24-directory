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
