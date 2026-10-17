// =============================================
// server/src/middleware/rateLimiter.js
// In-Memory IP & Account Rate Limiter
// =============================================
// Tracks failed login attempts per IP address/email
// to prevent brute-force credential stuffing.
// =============================================

const attemptsMap = new Map();

/**
 * Cleanup expired entries every 10 minutes
 */
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of attemptsMap.entries()) {
    if (now > record.resetTime) {
      attemptsMap.delete(key);
    }
  }
}, 10 * 60 * 1000).unref();

/**
 * Express middleware to rate limit login attempts.
 * Configured by default: 5 attempts per windowMs (15 minutes).
 */
function loginRateLimiter({
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000,
} = {}) {
  return (req, res, next) => {
    // Determine key: combining client IP and submitted email
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown-ip';
    const email = req.body && req.body.email ? String(req.body.email).toLowerCase().trim() : 'no-email';
    const key = `${ip}:${email}`;

    const now = Date.now();
    let record = attemptsMap.get(key);

    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime: now + windowMs };
      attemptsMap.set(key, record);
    }

    if (record.count >= maxAttempts) {
      const waitMinutes = Math.ceil((record.resetTime - now) / 60000);
      return res.status(429).json({
        success: false,
        message: `Too many failed login attempts. Please try again in ${waitMinutes} minute(s).`,
      });
    }

    // Attach hook to increment on failed login response
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // If status is 401 Unauthorized, record a failed attempt
      if (res.statusCode === 401) {
        record.count += 1;
      } else if (res.statusCode === 200 && body && body.success) {
        // Successful login resets counter for this key
        attemptsMap.delete(key);
      }
      return originalJson(body);
    };

    next();
  };
}

module.exports = {
  loginRateLimiter,
  attemptsMap,
};
