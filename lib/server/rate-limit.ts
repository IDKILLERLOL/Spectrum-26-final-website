/**
 * Simple in-memory sliding window rate limiter for edge/serverless runtimes.
 * Automatically evicts expired IP tracking windows.
 */

interface RateLimitRecord {
  count: number
  resetAt: number
}

const rateLimitMap = new Map<string, RateLimitRecord>()

// Clean up stale entries every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanupStale() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  lastCleanup = now
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetAt) {
      rateLimitMap.delete(ip)
    }
  }
}

/**
 * Checks if an IP exceeds max allowed attempts within the window.
 * 
 * @param ip Client IP address
 * @param limit Maximum allowed requests within window (default: 5)
 * @param windowMs Time window in milliseconds (default: 3 minutes = 180,000 ms)
 */
export function checkRateLimit(
  ip: string,
  limit: number = 5,
  windowMs: number = 3 * 60 * 1000
): { allowed: boolean; remaining: number; retryAfterSec: number } {
  cleanupStale()

  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, retryAfterSec: 0 }
  }

  if (record.count >= limit) {
    const retryAfterSec = Math.max(1, Math.ceil((record.resetAt - now) / 1000))
    return { allowed: false, remaining: 0, retryAfterSec }
  }

  record.count += 1
  return { allowed: true, remaining: limit - record.count, retryAfterSec: 0 }
}
