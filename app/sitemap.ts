import { MetadataRoute } from 'next'
import { CITIES, CA_COUNTIES } from '@/lib/california-data'

const BASE_URL = 'https://title24directory.com'

const articles = [
  'what-is-a-hers-rater',
  'cf2r-vs-cf3r',
  'title-24-compliance-guide',
  'what-is-acceptance-testing',
  'hers-vs-ecc-rater',
  'title-24-solar-requirements',
  'what-is-a-cf1r',
  'duct-leakage-testing',
  'heat-pump-water-heater-title-24',
  'performance-path-title-24',
  'hvac-replacement-hers-rater',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const cityPages = CITIES.map(city => ({
    url: `${BASE_URL}/directory/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  const countyPages = CA_COUNTIES.map(county => ({
    url: `${BASE_URL}/directory/county/${county.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  const articlePages = articles.map(slug => ({
    url: `${BASE_URL}/resources/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const corePages = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${BASE_URL}/directory`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${BASE_URL}/get-listed`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${BASE_URL}/resources`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
  ]

  return [...corePages, ...countyPages, ...cityPages, ...articlePages]
}
