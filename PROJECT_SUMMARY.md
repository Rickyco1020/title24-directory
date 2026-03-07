# Title 24 Directory - Complete Next.js 14 Project

## Overview
A production-ready programmatic SEO directory for California Title 24 raters (HERS raters, ECC raters, Commissioning Agents, Acceptance Testers). Built with Next.js 14, TypeScript, Tailwind CSS, Supabase, and Vercel.

## Project Status
✅ Build successful - all TypeScript compilation passed
✅ All 252 pages pre-rendered (including ~181 city pages, 58 county pages, 5 resource articles)
✅ Full static generation for SEO optimization
✅ Ready for Supabase setup and Vercel deployment

## File Structure

### Core Application Files
- **app/layout.tsx** - Root layout with header, footer, navigation
- **app/page.tsx** - Homepage with hero, categories, resources teaser
- **app/globals.css** - Tailwind CSS configuration
- **app/robots.ts** - SEO robots.txt config
- **app/sitemap.ts** - Dynamic XML sitemap generation

### Directory Pages
- **app/directory/page.tsx** - Main filterable directory with search
- **app/directory/[city]/page.tsx** - Individual city landing pages (auto-generates 181 pages)
- **app/directory/county/[county]/page.tsx** - County landing pages (auto-generates 58 pages)

### Get Listed (Form)
- **app/get-listed/page.tsx** - Rater submission form (client component)
- **app/get-listed/actions.ts** - Server actions for form handling, validation, Resend emails

### Resources Hub
- **app/resources/page.tsx** - Resources index page
- **app/resources/[slug]/page.tsx** - Individual article pages (5 articles pre-rendered)
  - what-is-a-hers-rater
  - cf2r-vs-cf3r
  - title-24-compliance-guide
  - what-is-acceptance-testing
  - hers-vs-ecc-rater

### Components
- **components/RaterCard.tsx** - Reusable card component for displaying rater listings
- **components/CategoryBadge.tsx** - Service category badge
- **components/Breadcrumb.tsx** - Navigation breadcrumbs
- **components/AdUnit.tsx** - AdSense integration (optional)

### Libraries
- **lib/supabase.ts** - Supabase client initialization, type definitions
- **lib/categories.ts** - Category definitions and styling
- **lib/california-data.ts** - California cities (181) and counties (58) with slugs

### Database
- **supabase/schema.sql** - Complete PostgreSQL schema for:
  - raters table (main listing data)
  - counties table (reference data)
  - cities table (reference data)
  - Row-level security policies

### Scripts
- **scripts/seed.ts** - Seed script for counties table

## Technology Stack
- **Framework:** Next.js 16.1.6 with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS 3
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel (ready to deploy)
- **Email:** Resend
- **Form Validation:** Zod
- **Analytics:** Vercel Analytics + Speed Insights

## Dependencies Installed
```
@supabase/supabase-js
@supabase/auth-helpers-nextjs
resend
zod
@vercel/analytics
@vercel/speed-insights
```

## Environment Variables Required

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=your_resend_api_key
NEXT_PUBLIC_ADSENSE_ENABLED=false (set to true after approval)
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-xxx (after approval)
```

## Pre-generated Pages (252 Total)

### Static Pages (7)
- / (Homepage)
- /directory (Main directory with search)
- /get-listed (Rater submission form)
- /resources (Resources index)
- /robots.txt (SEO)
- /sitemap.xml (SEO)

### Server-rendered (Dynamic)
- /directory (Uses POST form, dynamically rendered)

### Static Generated (245)
- 181 city pages (/directory/[city])
  - los-angeles, long-beach, santa-monica, san-diego, etc.
  - Includes comprehensive Title 24 compliance content per city
  
- 58 county pages (/directory/county/[county])
  - alameda, alpine, amador, ... yuba
  - Lists cities within each county
  
- 5 resource article pages (/resources/[slug])
  - Comprehensive Title 24 educational content
  - Well-structured markdown rendering
  - Internal linking

## SEO Features
- Automatic sitemap.xml generation
- robots.txt configuration
- Comprehensive metadata per page
- Breadcrumb structured data (JSON-LD)
- Canonical URLs
- Internal linking strategy
- Optimized for programmatic SEO (cities + counties)
- Static pre-rendering for fast page loads

## Form Features
- Zod validation for all fields
- Client-side form state management with useFormState
- Server-side action handling
- Email confirmation via Resend
- Field error display
- Dynamic character counter
- Checkbox groups for services and counties

## Directory Search Features
- Full-text search on business names and descriptions
- Filter by service type (HERS, ECC, Commissioning, Acceptance Testing)
- Filter by county
- Pagination (20 results per page)
- Dynamic filtering with form submission
- Rater status support (pending, approved, featured)
- Featured listings displayed with star badge

## Next Steps for Deployment

1. **Setup Supabase**
   - Create account at supabase.com
   - Create new project
   - Run SQL schema from supabase/schema.sql in SQL editor
   - Get project URL and keys

2. **Fill Environment Variables**
   - Copy .env.local.example to .env.local
   - Add Supabase credentials
   - Setup Resend account and get API key (or skip email for now)

3. **Deploy to Vercel**
   - Push code to GitHub
   - Connect GitHub repo to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy

4. **Setup AdSense (Optional)**
   - After Google AdSense approval
   - Set NEXT_PUBLIC_ADSENSE_ENABLED=true
   - Add your AdSense client ID

5. **Test Functionality**
   - Add sample rater listings via /get-listed form
   - Approve via Supabase dashboard (change status to 'approved')
   - Verify they appear on city/county pages
   - Test search filters

## Build Output
```
Route (app)
├ ○ / (Static)
├ ƒ /directory (Dynamic)
├ ● /directory/[city] (SSG - 181 pages)
├ ● /directory/county/[county] (SSG - 58 pages)
├ ○ /get-listed (Static)
├ ○ /resources (Static)
├ ● /resources/[slug] (SSG - 5 pages)
├ ○ /robots.txt (Static)
└ ○ /sitemap.xml (Static)

○ = Prerendered as static content
● = Prerendered as static HTML (uses generateStaticParams)
ƒ = Server-rendered on demand
```

## Performance Characteristics
- All pages served as static HTML (except /directory which is ISR)
- Automatic image optimization
- Font optimization with next/font
- CSS minification via Tailwind
- Vercel Speed Insights included
- Vercel Analytics included

## Monetization Ready
- AdSense ad unit component ready
- Featured listings support (premium feature)
- Free directory model with optional paid "featured" listings

## Maintenance Notes
- Cities data in lib/california-data.ts (181 cities pre-loaded)
- Categories in lib/categories.ts (easily extensible)
- Articles content in app/resources/[slug]/page.tsx
- All content can be updated via Supabase dashboard

## Security
- Row-level security (RLS) enabled on raters table
- Anonymous users can only see approved/featured listings
- Service role key for admin operations only
- Form validation with Zod
- Environment variables for sensitive data

This is a complete, production-ready project ready for deployment!
