/**
 * In-memory sliding window / token bucket rate limiter for AI Chat endpoint
 */
const rateLimitMap = new Map();

// Cleanup stale rate limit records every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now - record.windowStart > 60000) {
      rateLimitMap.delete(key);
    }
  }
}, 300000);

/**
 * Lightweight Route-Specific Rate Limiter for AI Chatbot
 * @param {object} options
 * @param {number} [options.maxRequests=10] - Maximum requests allowed per window
 * @param {number} [options.windowMs=60000] - Window duration in milliseconds (default: 1 minute)
 */
export const aiRateLimiter = (options = {}) => {
  const maxRequests = options.maxRequests || parseInt(process.env.AI_RATE_LIMIT_MAX, 10) || 10;
  const windowMs = options.windowMs || parseInt(process.env.AI_RATE_LIMIT_WINDOW_MS, 10) || 60000;

  return (req, res, next) => {
    const userId = req.user?._id?.toString() || req.ip || 'anonymous';
    const now = Date.now();

    let record = rateLimitMap.get(userId);

    if (!record || now - record.windowStart > windowMs) {
      record = {
        windowStart: now,
        count: 1,
      };
      rateLimitMap.set(userId, record);
      return next();
    }

    if (record.count >= maxRequests) {
      const remainingSeconds = Math.ceil((record.windowStart + windowMs - now) / 1000);
      return res.status(429).json({
        success: false,
        message: `You have reached the AI message rate limit (${maxRequests} requests per minute). Please wait ${remainingSeconds}s before sending another question.`,
        retryAfter: remainingSeconds,
      });
    }

    record.count += 1;
    next();
  };
};

export default aiRateLimiter;
