import { supabase } from "@/integrations/supabase/client";

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Rate limiter for sensitive operations
 * Tracks attempts in memory with optional database persistence
 */
class RateLimiter {
  private attempts = new Map<string, { count: number; resetAt: number; blockedUntil?: number }>();

  /**
   * Check if an action is allowed under rate limits
   * @param key - Unique identifier for the rate limit (e.g., "login:user@email.com")
   * @param config - Rate limit configuration
   * @returns Rate limit result with allowed status
   */
  async check(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    const now = Date.now();
    const existing = this.attempts.get(key);

    // Check if blocked
    if (existing?.blockedUntil && existing.blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(existing.blockedUntil),
      };
    }

    // Reset if window expired
    if (!existing || existing.resetAt < now) {
      this.attempts.set(key, {
        count: 1,
        resetAt: now + config.windowMs,
      });
      return {
        allowed: true,
        remaining: config.maxAttempts - 1,
        resetAt: new Date(now + config.windowMs),
      };
    }

    // Increment count
    existing.count++;
    
    // Check if limit exceeded
    if (existing.count > config.maxAttempts) {
      if (config.blockDurationMs) {
        existing.blockedUntil = now + config.blockDurationMs;
      }
      
      // Log violation to database
      await this.logViolation(key);
      
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(existing.blockedUntil || existing.resetAt),
      };
    }

    return {
      allowed: true,
      remaining: config.maxAttempts - existing.count,
      resetAt: new Date(existing.resetAt),
    };
  }

  /**
   * Record a successful action (resets count)
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }

  /**
   * Log rate limit violation to database for monitoring
   */
  private async logViolation(key: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('security_logs').insert({
        user_id: user?.id || null,
        event_type: 'rate_limit_exceeded',
        event_data: { key },
        ip_address: null, // Browser doesn't have access to real IP
      });
    } catch (error) {
      console.error('Failed to log rate limit violation:', error);
    }
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Predefined rate limit configs for common operations
export const RATE_LIMITS = {
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes
  },
  SIGNUP: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 24 * 60 * 60 * 1000, // 24 hours
  },
  MEDICAL_ACCESS: {
    maxAttempts: 50,
    windowMs: 5 * 60 * 1000, // 5 minutes
  },
  FILE_UPLOAD: {
    maxAttempts: 20,
    windowMs: 10 * 60 * 1000, // 10 minutes
  },
  PASSWORD_RESET: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 2 * 60 * 60 * 1000, // 2 hours
  },
  POST_CREATE: {
    maxAttempts: 10,
    windowMs: 5 * 60 * 1000, // 5 minutes
  },
  DONATION: {
    maxAttempts: 5,
    windowMs: 10 * 60 * 1000, // 10 minutes
  },
  FOLLOW_ACTION: {
    maxAttempts: 30,
    windowMs: 5 * 60 * 1000, // 5 minutes
    blockDurationMs: 15 * 60 * 1000, // 15 minutes
  },
  MESSAGE_SEND: {
    maxAttempts: 60,
    windowMs: 1 * 60 * 1000, // 1 minute
    blockDurationMs: 5 * 60 * 1000, // 5 minutes
  },
  PROFILE_UPDATE: {
    maxAttempts: 5,
    windowMs: 10 * 60 * 1000, // 10 minutes
  },
  COMMENT_CREATE: {
    maxAttempts: 30,
    windowMs: 5 * 60 * 1000, // 5 minutes
  },
  LIKE_ACTION: {
    maxAttempts: 100,
    windowMs: 1 * 60 * 1000, // 1 minute
  },
  SEARCH_QUERY: {
    maxAttempts: 50,
    windowMs: 1 * 60 * 1000, // 1 minute
  },
} as const;
