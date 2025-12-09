// Rate limiting utility for edge functions
// Uses in-memory store - suitable for single-instance functions

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000,  // 1 minute
  maxRequests: 60,  // 60 requests per minute
};

export function checkRateLimit(
  identifier: string,
  config: Partial<RateLimitConfig> = {}
): { allowed: boolean; remaining: number; resetAt: number } {
  const { windowMs, maxRequests } = { ...defaultConfig, ...config };
  const now = Date.now();
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now) {
        rateLimitStore.delete(key);
      }
    }
  }
  
  const entry = rateLimitStore.get(identifier);
  
  if (!entry || entry.resetAt < now) {
    // New window
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(identifier, newEntry);
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: newEntry.resetAt,
    };
  }
  
  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }
  
  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

export function rateLimitResponse(resetAt: number): Response {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
  return new Response(
    JSON.stringify({ error: 'Too many requests', retryAfter }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}

// Stricter limits for sensitive operations
export const strictRateLimit: RateLimitConfig = {
  windowMs: 60 * 1000,  // 1 minute
  maxRequests: 10,  // 10 requests per minute
};

// Relaxed limits for read-heavy operations
export const relaxedRateLimit: RateLimitConfig = {
  windowMs: 60 * 1000,  // 1 minute
  maxRequests: 120,  // 120 requests per minute
};
