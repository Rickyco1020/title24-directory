import { ImageResponse } from 'next/og'
import { supabase } from '@/lib/supabase'
import { CATEGORY_LABELS, displayServices } from '@/lib/categories'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { id: string } }) {
  const { data: rater } = await supabase
    .from('raters')
    .select('business_name, services, counties_served')
    .eq('id', params.id)
    .single()

  const name = rater?.business_name ?? 'Title 24 Rater'
  const services = displayServices(rater?.services).map((s: string) => CATEGORY_LABELS[s] ?? s)
  const counties = (rater?.counties_served ?? []).slice(0, 3).join(', ')

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
        {/* Location */}
        {counties && (
          <div style={{ color: '#bfdbfe', fontSize: '24px' }}>
            📍 Serving {counties}{(rater?.counties_served?.length ?? 0) > 3 ? ' + more' : ''}
          </div>
        )}
      </div>
    ),
    { ...size }
  )
}
