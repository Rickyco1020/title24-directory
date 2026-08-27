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

Both seed scripts need `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
in the environment — RLS blocks anonymous writes.

### Geography

```bash
npm run seed:geo
```

Upserts `counties` and `cities` from `lib/california-data.ts`. That file is the
single source of truth: the city and county pages read it directly, not the
tables, so the seed is generated from it rather than from a second list that
would drift. Idempotent — upserts on `slug`, never duplicates, never deletes.

### Listings

```bash
npm run seed:raters -- path/to/raters.seed.json [--dry-run]
```

Inserts researched listings into `raters`, **forcing `source = 'seeded'`**.
That column is not optional bookkeeping: the "Claim or remove this listing"
link renders only for seeded rows, and the column defaults to `'self'`. A
re-seed done by hand — or by any script that omits it — silently strips the
claim link from every seeded card.

The input file is deliberately **not** in this repository. Listings carry
contact emails and phone numbers and this repo is public, so the seed data
lives outside it (`/data/` is gitignored). Rows are matched by email and
existing listings are skipped, never overwritten — a business that has since
claimed and corrected its listing keeps those corrections.
