import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim()
}

const counties = [
  'Alameda','Alpine','Amador','Butte','Calaveras','Colusa','Contra Costa','Del Norte',
  'El Dorado','Fresno','Glenn','Humboldt','Imperial','Inyo','Kern','Kings','Lake','Lassen',
  'Los Angeles','Madera','Marin','Mariposa','Mendocino','Merced','Modoc','Mono','Monterey',
  'Napa','Nevada','Orange','Placer','Plumas','Riverside','Sacramento','San Benito',
  'San Bernardino','San Diego','San Francisco','San Joaquin','San Luis Obispo','San Mateo',
  'Santa Barbara','Santa Clara','Santa Cruz','Shasta','Sierra','Siskiyou','Solano','Sonoma',
  'Stanislaus','Sutter','Tehama','Trinity','Tulare','Tuolumne','Ventura','Yolo','Yuba'
]

async function seed() {
  console.log('Seeding counties...')
  const countyRows = counties.map(name => ({ name, slug: slugify(name) }))
  const { error: ce } = await supabase.from('counties').upsert(countyRows, { onConflict: 'slug' })
  if (ce) console.error('County error:', ce)
  else console.log(`Seeded ${countyRows.length} counties`)

  console.log('Done! Add cities from CA Open Data Portal to complete the seed.')
}

seed()
