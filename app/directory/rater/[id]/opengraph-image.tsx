import { ImageResponse } from 'next/og'
import { supabase } from '@/lib/supabase'
import { CATEGORY_LABELS, displayServices } from '@/lib/categories'
import { countyName } from '@/lib/california-data'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// `params` is a Promise in Next 16. Typed as a plain object and read
// synchronously, `params.id` was `undefined`, the lookup below missed, and
// every rater's card fell through to the hardcoded default — 108 profiles
// sharing one anonymous social image. Nothing catches this but a byte diff.
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: rater } = await supabase
    .from('raters')
    .select('business_name, services, counties_served')
    .eq('id', id)
    .single()

  const name = rater?.business_name ?? 'Title 24 Rater'
  const services = displayServices(rater?.services).map((s: string) => CATEGORY_LABELS[s] ?? s)
  // Slugs, not display names, are what the column stores — joined raw this read
  // 'Serving los-angeles, san-bernardino' on the card. Invisible until the
  // lookup above started returning a rater.
  const counties = (rater?.counties_served ?? []).slice(0, 3).map(countyName).join(', ')
  // Built as one string rather than three JSX children on purpose: Satori
  // rejects a <div> with more than one child node unless it declares
  // `display: flex`, and this line only ever had more than one child once the
  // lookup above started returning a rater. See the note on the div below.
  const location = counties
    ? `\u{1F4CD} Serving ${counties}${(rater?.counties_served?.length ?? 0) > 3 ? ' + more' : ''}`
    : ''

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'auto' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '8px 16px', display: 'flex' }}>
            <span style={{ color: 'white', fontSize: '20px', fontWeight: 700 }}>Title24 Directory</span>
          </div>
        </div>
        {/* Business name */}
        <div style={{ color: 'white', fontSize: '60px', fontWeight: 800, lineHeight: 1.1, marginBottom: '20px', maxWidth: '1000px' }}>
          {name}
        </div>
        {/* Services */}
        {services.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {services.map((s: string) => (
              <div key={s} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', fontSize: '20px', fontWeight: 600, padding: '8px 20px', borderRadius: '999px' }}>
                {s}
              </div>
            ))}
          </div>
        )}
        {/* Location. One text child — Satori throws
            "Expected <div> to have explicit display: flex ... if it has more
            than one child node" otherwise, and the whole image 500s. */}
        {location && (
          <div style={{ color: '#bfdbfe', fontSize: '24px' }}>{location}</div>
        )}
      </div>
    ),
    { ...size }
  )
}
