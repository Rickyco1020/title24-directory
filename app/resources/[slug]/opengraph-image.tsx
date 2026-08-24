import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const articles: Record<string, { title: string; tags: string[] }> = {
  'what-is-a-hers-rater': { title: 'What Is a HERS Rater (Now Called an ECC Rater)?', tags: ['HERS', 'ECC'] },
  'cf2r-vs-cf3r': { title: 'CF2R vs CF3R: What\'s the Difference?', tags: ['Forms'] },
  'title-24-compliance-guide': { title: 'California Title 24 Compliance: A Builder\'s Complete Guide', tags: ['Compliance'] },
  'what-is-acceptance-testing': { title: 'What Does an Acceptance Tester Do?', tags: ['Compliance'] },
  'hers-vs-ecc-rater': { title: 'HERS Rater or ECC Rater? Same Role, New Name', tags: ['HERS', 'ECC'] },
  'title-24-solar-requirements': { title: 'Title 24 Solar PV Requirements for New Construction', tags: ['Solar', 'Compliance'] },
  'what-is-a-cf1r': { title: 'What Is a CF1R? California Title 24 Compliance Report Explained', tags: ['Forms'] },
  'duct-leakage-testing': { title: 'Duct Leakage Testing in California: What to Expect', tags: ['HVAC', 'HERS'] },
  'heat-pump-water-heater-title-24': { title: 'Heat Pump Water Heater Requirements Under Title 24', tags: ['HVAC', 'Compliance'] },
  'performance-path-title-24': { title: 'The Performance Path to Title 24 Compliance', tags: ['Compliance', 'HVAC'] },
  'hvac-replacement-hers-rater': { title: 'HVAC Replacement and Title 24: When You Need a HERS Rater', tags: ['HVAC', 'HERS'] },
}

export default function Image({ params }: { params: { slug: string } }) {
  const article = articles[params.slug]
  const title = article?.title ?? 'Title 24 Resources'
  const tags = article?.tags ?? []

  return new ImageResponse(
    (
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px',
          fontFamily: 'sans-serif',
          borderTop: '12px solid #1d4ed8',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'auto' }}>
          <span style={{ color: '#1d4ed8', fontSize: '22px', fontWeight: 800 }}>Title24</span>
          <span style={{ color: '#374151', fontSize: '22px', fontWeight: 600 }}> Directory</span>
          <span style={{ color: '#9ca3af', fontSize: '22px', marginLeft: '12px' }}>· Resources</span>
        </div>
        {/* Tags */}
        {tags.length > 0 && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
            {tags.map(tag => (
              <div key={tag} style={{ background: '#dbeafe', color: '#1e40af', fontSize: '18px', fontWeight: 700, padding: '6px 16px', borderRadius: '999px' }}>
                {tag}
              </div>
            ))}
          </div>
        )}
        {/* Title */}
        <div style={{ color: '#111827', fontSize: '52px', fontWeight: 800, lineHeight: 1.15, maxWidth: '1000px' }}>
          {title}
        </div>
        <div style={{ marginTop: '32px', color: '#6b7280', fontSize: '22px' }}>
          title24directory.com/resources
        </div>
      </div>
    ),
    { ...size }
  )
}
