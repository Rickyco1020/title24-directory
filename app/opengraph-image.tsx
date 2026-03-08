import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Title 24 Directory — Find HERS & ECC Raters in California'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '12px' }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '10px 20px', display: 'flex' }}>
            <span style={{ color: '#1d4ed8', fontSize: '28px', fontWeight: 800 }}>Title24</span>
            <span style={{ color: '#374151', fontSize: '28px', fontWeight: 600 }}> Directory</span>
          </div>
        </div>
        <div style={{ color: 'white', fontSize: '62px', fontWeight: 700, textAlign: 'center', lineHeight: 1.15, marginBottom: '20px', maxWidth: '900px' }}>
          Find a Title 24 Rater in California
        </div>
        <div style={{ color: '#bfdbfe', fontSize: '28px', textAlign: 'center', maxWidth: '780px', lineHeight: 1.4 }}>
          HERS Raters · ECC Raters · Commissioning Agents · Acceptance Testers
        </div>
      </div>
    ),
    { ...size }
  )
}
