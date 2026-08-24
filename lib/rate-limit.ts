import { headers } from 'next/headers'
import { HONEYPOT_FIELD } from '@/lib/forms'

/**
 * Small in-process fixed-window rate limiter for the unauthenticated public
 * forms. State lives in the serverless instance's memory, so it is best-effort:
 * it stops the obvious flood (one client hammering the form) without adding a
 * dependency or a database round-trip. The per-submitter duplicate check in the
 * actions themselves is the durable half of the defence.
 */

type Window = { count: number; resetAt: number }

const WINDOWS = new Map<string, Window>()
const MAX_KEYS = 5000

function prune(now: number) {
  if (WINDOWS.size < MAX_KEYS) return
  for (const [key, win] of WINDOWS) {
    if (win.resetAt <= now) WINDOWS.delete(key)
  }
}

export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number }

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

/** Best-effort caller IP. Vercel always sets x-forwarded-for. */
export async function clientIp(): Promise<string> {
  const h = await headers()
  const forwarded = h.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return h.get('x-real-ip') ?? 'unknown'
}

export function honeypotTripped(formData: FormData): boolean {
  const value = formData.get(HONEYPOT_FIELD)
  return typeof value === 'string' && value.trim().length > 0
}
