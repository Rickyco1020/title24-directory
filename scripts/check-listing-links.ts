/**
 * Check every outbound rater website the directory links to.
 *
 * WHY THIS EXISTS
 * ---------------
 * A directory is worth what its links are worth. Listings are seeded from
 * public research and then sit untouched for months, so a business that folds,
 * lets its domain lapse, or moves host takes a dead link on a city page with
 * it — and nothing on the site notices. This reads the same rows the site
 * renders and reports which of those links a visitor can still follow.
 *
 * Three outcomes, and the difference between the last two is the whole point:
 *
 *   OK          the site answered.
 *   BOT-BLOCKED 403, 406 or 999 — a WAF turning away a script. Real visitors
 *               in a real browser almost always get through. Not a problem to
 *               fix, and deliberately NOT a failure.
 *   DEAD        the domain does not resolve, refuses the connection, or the
 *               server is erroring (5xx). This is a link to remove.
 *   OTHER       anything that is neither (404s, timeouts, TLS failures).
 *               Reported, never fatal: a 404 means the domain is alive and the
 *               path moved, and a timeout is as likely to be this network as
 *               theirs. Read the report, then judge by hand.
 *
 * Exits non-zero only when something is DEAD.
 *
 * REPORT ONLY. This script never writes to the database. Removing or editing a
 * listing is a judgement call about somebody's business, made by a person.
 *
 * USAGE
 * -----
 *   NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
 *     npx tsx scripts/check-listing-links.ts [--out path] [--concurrency n]
 *
 * The anon key on purpose, not the service-role key: RLS then hands back
 * exactly the approved and featured listings a visitor sees, which is exactly
 * the set of links that can be clicked. The report defaults to
 * data/link-report.json — /data/ is gitignored, and this report names
 * businesses.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { createClient } from '@supabase/supabase-js'

type Verdict = 'OK' | 'BOT-BLOCKED' | 'DEAD' | 'OTHER'

type Result = {
  url: string
  listed_as: string
  listings: string[]
  verdict: Verdict
  status: number | null
  final_url: string | null
  error: string | null
  attempts: number
  ms: number
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !ANON_KEY) {
  console.error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.\n' +
      'This script only reads — the anon key is enough, and RLS keeps it to the\n' +
      'approved and featured listings the site actually links out to.'
  )
  process.exit(1)
}

const args = process.argv.slice(2)

function flag(name: string, fallback: string): string {
  const i = args.indexOf(`--${name}`)
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback
}

const outFile = flag('out', 'data/link-report.json')
const concurrency = Math.max(1, Number(flag('concurrency', '8')) || 8)

const TIMEOUT_MS = 15_000

// A plain fetch User-Agent is turned away by hosts that would serve a person
// fine, which would report healthy sites as broken. This is a real browser
// string so that a block is a real block.
const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
}

const supabase = createClient(SUPABASE_URL, ANON_KEY)

/** Listings store what the rater typed. Fill in a missing scheme, reject junk. */
function normalise(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const url = new URL(withScheme)
    return url.hostname.includes('.') ? url.toString() : null
  } catch {
    return null
  }
}

/** undici hides the interesting part one level down, on `cause`. */
function errorCode(err: unknown): string {
  const cause = (err as { cause?: { code?: string } })?.cause
  if (cause?.code) return cause.code
  const name = (err as { name?: string })?.name
  if (name === 'AbortError') return 'ETIMEDOUT'
  return (err as { message?: string })?.message ?? 'unknown error'
}

const DEAD_CODES = new Set([
  'ENOTFOUND', // NXDOMAIN — the domain is gone
  'ECONNREFUSED', // resolves, nothing listening
  'ECONNRESET',
  'EHOSTUNREACH',
  'ENETUNREACH',
])

type Attempt = { status: number | null; finalUrl: string | null; error: string | null }

async function request(url: string): Promise<Attempt> {
  // An explicit controller rather than AbortSignal.timeout so a timeout is
  // distinguishable from any other abort, and so the timer is always cleared.
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    // GET, not HEAD: too many hosts answer HEAD with 405 and would look broken.
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: HEADERS,
      signal: controller.signal,
    })
    return { status: res.status, finalUrl: res.url || url, error: null }
  } catch (err) {
    return { status: null, finalUrl: null, error: errorCode(err) }
  } finally {
    clearTimeout(timer)
  }
}

function verdictFor({ status, error }: Attempt): Verdict {
  if (error) return DEAD_CODES.has(error) ? 'DEAD' : 'OTHER'
  if (status === null) return 'OTHER'
  if (status === 403 || status === 406 || status === 999) return 'BOT-BLOCKED'
  if (status >= 500) return 'DEAD'
  if (status < 400) return 'OK'
  return 'OTHER'
}

async function check(url: string): Promise<Attempt & { attempts: number; ms: number }> {
  const started = Date.now()
  const attempt = await request(url)

  // One retry, and only where a retry can change the answer: a transport error
  // or a 5xx. A 403 will be a 403 again, and hammering it is rude.
  const retryable = attempt.error !== null || (attempt.status !== null && attempt.status >= 500)
  if (retryable) {
    await new Promise(resolve => setTimeout(resolve, 1_000))
    const second = await request(url)
    return { ...second, attempts: 2, ms: Date.now() - started }
  }
  return { ...attempt, attempts: 1, ms: Date.now() - started }
}

/** Fixed pool of workers over one shared queue. */
async function runPool<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length)
  let next = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++
      results[i] = await worker(items[i])
    }
  })
  await Promise.all(runners)
  return results
}

async function checkListingLinks() {
  const { data, error } = await supabase
    .from('raters')
    .select('business_name, website, status')
    .in('status', ['approved', 'featured'])
    .not('website', 'is', null)
    .order('business_name')

  if (error) {
    console.error('could not read listings:', error.message)
    process.exit(1)
  }

  const rows = data ?? []

  // One request per distinct site, not per listing — several listings can share
  // a domain, and the host should be asked once.
  const byUrl = new Map<string, { listed_as: string; listings: string[] }>()
  const unparseable: { business_name: string; website: string }[] = []

  for (const row of rows) {
    const website = String(row.website)
    const url = normalise(website)
    if (!url) {
      unparseable.push({ business_name: row.business_name, website })
      continue
    }
    const entry = byUrl.get(url)
    if (entry) entry.listings.push(row.business_name)
    else byUrl.set(url, { listed_as: website, listings: [row.business_name] })
  }

  const urls = [...byUrl.keys()]
  console.log(`${rows.length} listings with a website — ${urls.length} distinct sites\n`)

  const results: Result[] = await runPool(urls, concurrency, async url => {
    const { status, finalUrl, error: err, attempts, ms } = await check(url)
    const meta = byUrl.get(url)!
    const result: Result = {
      url,
      listed_as: meta.listed_as,
      listings: meta.listings,
      verdict: verdictFor({ status, finalUrl, error: err }),
      status,
      final_url: finalUrl,
      error: err,
      attempts,
      ms,
    }
    console.log(`  ${result.verdict.padEnd(11)} ${String(status ?? err).padEnd(14)} ${url}`)
    return result
  })

  const order: Verdict[] = ['DEAD', 'OTHER', 'BOT-BLOCKED', 'OK']
  results.sort((a, b) => order.indexOf(a.verdict) - order.indexOf(b.verdict) || a.url.localeCompare(b.url))

  const counts = Object.fromEntries(
    order.map(v => [v, results.filter(r => r.verdict === v).length])
  ) as Record<Verdict, number>

  console.log('\n  VERDICT      HTTP   SITE')
  console.log('  ' + '-'.repeat(76))
  for (const r of results) {
    if (r.verdict === 'OK') continue
    const code = r.status !== null ? String(r.status) : (r.error ?? '?')
    console.log(
      `  ${r.verdict.padEnd(12)} ${code.padEnd(6)} ${r.url}\n` +
        `  ${' '.repeat(19)} ${r.listings.join(', ')}`
    )
  }
  if (unparseable.length) {
    console.log('\n  Not a usable URL at all:')
    for (const u of unparseable) console.log(`    ${u.business_name}: ${JSON.stringify(u.website)}`)
  }

  console.log(
    `\n  ${counts.OK} OK  ·  ${counts['BOT-BLOCKED']} bot-blocked  ·  ` +
      `${counts.OTHER} other  ·  ${counts.DEAD} dead` +
      (unparseable.length ? `  ·  ${unparseable.length} unparseable` : '')
  )

  const report = {
    checked_at: new Date().toISOString(),
    listings_with_website: rows.length,
    distinct_sites: urls.length,
    timeout_ms: TIMEOUT_MS,
    counts,
    unparseable,
    results,
  }
  mkdirSync(dirname(outFile), { recursive: true })
  writeFileSync(outFile, `${JSON.stringify(report, null, 2)}\n`)
  console.log(`  report: ${outFile}`)

  // Bot-blocked is not a failure, and neither is a 404 — only a link that has
  // nothing behind it any more.
  if (counts.DEAD > 0) {
    console.error(`\n${counts.DEAD} dead ${counts.DEAD === 1 ? 'link' : 'links'} — review and remove.`)
    process.exit(1)
  }
}

checkListingLinks()
