/**
 * Simple in-memory rate limiter.
 * Limits each IP to MAX_REQUESTS per WINDOW_MS.
 * Resets automatically as the window slides.
 *
 * Usage in a Next.js API route:
 *   const allowed = rateLimit(req.headers['x-forwarded-for'] as string || 'unknown');
 *   if (!allowed) return res.status(429).json({ error: 'Too many requests. Try again shortly.' });
 */

const MAX_REQUESTS = 20;        // requests per window per IP
const WINDOW_MS = 60 * 1000;   // 1 minute window

const store = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= MAX_REQUESTS) {
    return false; // rate limited
  }

  entry.count++;
  return true;
}
