// Simple in-memory sliding-window rate limiter, keyed by caller id (account
// id). Good enough to stop a single account from hammering paid AI endpoints
// and running up API costs; it resets on cold start and isn't shared across
// serverless instances, so it's a cost/abuse guard rather than a hard cap.

const hits = new Map<string, number[]>();

export function isRateLimited(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const windowStart = now - windowMs;
  const recentHits = (hits.get(key) ?? []).filter((timestamp) => timestamp > windowStart);

  if (recentHits.length >= limit) {
    hits.set(key, recentHits);
    return true;
  }

  recentHits.push(now);
  hits.set(key, recentHits);
  return false;
}
