import { Request, Response, NextFunction } from "express";
import ApiError from "../../errors/api_error";
import httpStatus from "http-status";
import { consumeRateLimit } from "./rate_limit.store";
import rateLimit from "express-rate-limit";

interface RateLimiterOptions {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests allowed within the window */
  maxRequests: number;
  /** Duration to block the IP in milliseconds once limit is exceeded */
  blockTimeMs: number;
  /** Unique key prefix to isolate this limiter's store entries (e.g. "login", "register") */
  keyPrefix: string;
  /** Human-readable label used in error messages (e.g. "login", "password reset") */
  actionLabel?: string;
  /** Optional custom message builder for the 429 response */
  buildMessage?: (retryAfterSec: number) => string;
}

class MongoRateLimitStore {
  keyPrefix: string;
  blockTimeMs: number;
  options!: any;

  constructor(keyPrefix: string, blockTimeMs: number) {
    this.keyPrefix = keyPrefix;
    this.blockTimeMs = blockTimeMs;
  }

  init(options: any) {
    this.options = options;
  }

  async increment(key: string) {
    const res = await consumeRateLimit({
      key: `${this.keyPrefix}_${key}`,
      windowMs: this.options.windowMs,
      maxRequests: this.options.max,
      blockTimeMs: this.blockTimeMs,
    });

    const now = Date.now();
    return {
      totalHits: res.allowed ? 1 : (this.options.max || 1) + 1,
      resetTime: new Date(
        now + (res.allowed ? this.options.windowMs : res.retryAfterSec * 1000)
      ),
    };
  }

  async resetKey(key: string): Promise<void> {
    // No-op
  }
}

/**
 * Factory that builds a rate-limiting middleware backed by the shared MongoDB
 * store, so limits hold across all serverless instances and cold starts.
 * Each prefix tracks its endpoint independently.
 */
export const createRateLimiter = (options: RateLimiterOptions) => {
  const { windowMs, maxRequests, blockTimeMs, keyPrefix, actionLabel = "request", buildMessage } = options;

  return rateLimit({
    windowMs,
    max: maxRequests,
    store: new MongoRateLimitStore(keyPrefix, blockTimeMs) as any,
    handler: (req: Request, res: Response, next: NextFunction) => {
      const retryAfter = res.getHeader("Retry-After");
      const retryAfterSec = retryAfter
        ? parseInt(String(retryAfter), 10)
        : Math.ceil(windowMs / 1000);
      const message = buildMessage
        ? buildMessage(retryAfterSec)
        : `Too many ${actionLabel} attempts. Please try again after ${Math.ceil(retryAfterSec / 60)} minutes.`;

      next(new ApiError(httpStatus.TOO_MANY_REQUESTS, message));
    },
  } as any);
};

// ── Pre-configured rate limiters for authentication endpoints ──

/** Registration: 5 attempts per hour, 24-hour block (original behaviour) */
export const ipRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,        // 1 hour
  maxRequests: 5,
  blockTimeMs: 24 * 60 * 60 * 1000, // 24 hours
  keyPrefix: "reg",
  actionLabel: "registration",
});

/** Login: 10 attempts per 15 minutes, 15-minute block */
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  maxRequests: 10,
  blockTimeMs: 15 * 60 * 1000, // 15 minutes
  keyPrefix: "login",
  actionLabel: "login",
});

/** Forgot Password: 3 attempts per hour, 1-hour block (prevents email spam) */
export const forgotPasswordRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,  // 1 hour
  maxRequests: 3,
  blockTimeMs: 60 * 60 * 1000, // 1 hour
  keyPrefix: "forgot_pw",
  actionLabel: "password reset",
});

/** Reset Password: 5 attempts per hour, 1-hour block */
export const resetPasswordRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,  // 1 hour
  maxRequests: 5,
  blockTimeMs: 60 * 60 * 1000, // 1 hour
  keyPrefix: "reset_pw",
  actionLabel: "password reset",
});


export const aiGenerationRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10,
  blockTimeMs: 5 * 60 * 1000, // 5 minutes
  keyPrefix: "ai_generation",
  actionLabel: "AI generation",
});


/** Payment: 20 attempts per 15 minutes, 15-minute block */
export const paymentRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  maxRequests: 20,
  blockTimeMs: 15 * 60 * 1000, // 15 minutes
  keyPrefix: "payment",
  actionLabel: "payment",
});

/** Bug report submit: 10 per hour, 1-hour block */
export const bugReportRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,  // 1 hour
  maxRequests: 10,
  blockTimeMs: 60 * 60 * 1000, // 1 hour
  keyPrefix: "bug_report",
  actionLabel: "bug report",
});

/** Contact form (sends email): 5 per hour, 1-hour block */
export const contactRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,  // 1 hour
  maxRequests: 5,
  blockTimeMs: 60 * 60 * 1000, // 1 hour
  keyPrefix: "contact",
  actionLabel: "contact",
});

/** Newsletter subscribe (sends email): 5 per hour, 1-hour block */
export const newsletterRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,  // 1 hour
  maxRequests: 5,
  blockTimeMs: 60 * 60 * 1000, // 1 hour
  keyPrefix: "newsletter",
  actionLabel: "newsletter subscription",
});

/**
 * Refresh Token: 10 attempts per 15 minutes, 15-minute block
 * (prevents token rotation abuse)
 */
export const refreshTokenRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  maxRequests: 10,
  blockTimeMs: 15 * 60 * 1000, // 15 minutes
  keyPrefix: "refresh_token",
  actionLabel: "token refresh",
});

export default ipRateLimiter;
