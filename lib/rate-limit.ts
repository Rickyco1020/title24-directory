import { headers } from 'next/headers'
import { HONEYPOT_FIELD } from '@/lib/forms'

/**
 * Small in-process fixed-window rate limiter for the unauthenticated public
 * forms. State lives in the serverless instance's memory, so it is best-effort:
 * it stops the obvious flood (one client hammering the form) without adding a
 * dependency or a database round-trip.
 */

type Window = { count: number; resetAt: number }

const WINDOWS = new Map<string, Window>()
const MAX_KEYS = 5000

function prune(now: number) {
  if (WINDOWS.size < MAX_KEYS) return

  for (const [key, win] of WINDOWS) {
    if (win.resetAt <= now) WINDOWS.delete(key)
  }
  if (WINDOWS.size < MAX_KEYS) return

  // Every entry is still live — someone is rotating keys at us. Evict the
  // entries closest to expiry until the map is back under budget, so the table
  // can never grow without bound and every request can never pay a full scan.
  const byExpiry = [...WINDOWS.entries()].sort((a, b) => a[1].resetAt - b[1].resetAt)
  const target = Math.floor(MAX_KEYS * 0.9)
  for (const [key] of byExpiry) {
    if (WINDOWS.size <= target) break
    WINDOWS.delete(key)
  }
}

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number }

/** Count one hit against `key`. */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  prune(now)

  const existing = WINDOWS.get(key)
  if (!existing || existing.resetAt <= now) {
    WINDOWS.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSeconds: 0 }
  }

  existing.count += 1
  if (existing.count > limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) }
  }
  return { allowed: true, retryAfterSeconds: 0 }
}

/**
 * Read the current count without consuming quota. Use this to reject before
 * doing work, then call rateLimit() to consume once the request is real —
 * otherwise a rater who mistypes their email three times is locked out.
 */
export function rateLimitExceeded(key: string, limit: number): boolean {
  const win = WINDOWS.get(key)
  if (!win || win.resetAt <= Date.now()) return false
  return win.count >= limit
}

/**
 * Best-effort caller IP.
 *
 * `x-real-ip` is set by the platform (Vercel) and is not client-settable, so it
 * is preferred. In `x-forwarded-for` the platform APPENDS the real peer, so the
 * LAST hop is the trustworthy one — the first entry is whatever the client sent
 * and can be forged both to evade a limit and to lock out someone else's IP.
 */
export async function clientIp(): Promise<string> {
  const h = await headers()
  const real = h.get('x-real-ip')
  if (real) return real.trim()

  const forwarded = h.get('x-forwarded-for')
  if (forwarded) {
    const hops = forwarded.split(',').map(s => s.trim()).filter(Boolean)
    if (hops.length) return hops[hops.length - 1]
  }
  return 'unknown'
}

export function honeypotTripped(formData: FormData): boolean {
  const value = formData.get(HONEYPOT_FIELD)
  return typeof value === 'string' && value.trim().length > 0
}

/** Strip CR/LF and clamp — anything that ends up in an email Subject header. */
export function headerSafe(value: string, max = 120): string {
  return value.replace(/[\r\n]+/g, ' ').trim().slice(0, max)
}
