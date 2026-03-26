// middleware/rateLimitMiddleware.js — Route-specific rate limiters

import rateLimit from "express-rate-limit";

/**
 * Auth rate limiter — stricter, for login/register/forgot-password
 * Prevents brute-force and credential stuffing attacks
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // max 10 attempts per window
  message: {
    success: false,
    message: "Too many attempts. Please try again in 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * AI rate limiter — prevents excessive use of the AI API
 * Each user gets 30 AI requests per 10 minutes
 */
const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50,                   // 50 AI requests per window
  message: {
    success: false,
    message: "Too many AI requests. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export { authLimiter, aiLimiter };

// Export authLimiter as default for auth routes import
export default authLimiter;