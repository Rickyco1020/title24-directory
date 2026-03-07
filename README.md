# Title 24 Directory

California's most complete directory of HERS raters, ECC raters, commissioning agents, and acceptance testers.

## Stack
- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres database)
- Vercel (hosting)
- Resend (email)

## Setup

1. **Clone and install**
   npm install

2. **Create Supabase project** at supabase.com, run `supabase/schema.sql` in the SQL editor

3. **Copy environment variables**
   cp .env.local.example .env.local
   Fill in your Supabase URL, anon key, service role key, and Resend API key.

4. **Run locally**
   npm run dev

5. **Deploy to Vercel**
   Push to GitHub, connect repo to Vercel, add environment variables in Vercel dashboard.

## Key Routes
- `/` — Homepage with search
- `/directory` — Filterable rater directory
- `/directory/[city]` — City landing pages (auto-generated for ~170 CA cities)
- `/directory/county/[county]` — County landing pages (58 counties)
- `/get-listed` — Rater submission form
- `/resources` — SEO article hub
- `/resources/[slug]` — Individual articles

## Monetization
- AdSense: Set `NEXT_PUBLIC_ADSENSE_ENABLED=true` and `NEXT_PUBLIC_ADSENSE_CLIENT_ID` after approval
- Featured listings: Update rater `status` to `featured` in Supabase dashboard

## Seeding Data
Run `npx ts-node scripts/seed.ts` after setting env vars to seed counties.
