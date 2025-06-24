import rateLimit from 'express-rate-limit';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export const createRateLimitMiddleware = (config: RateLimitConfig) => {
  return rateLimit({
    windowMs: config.windowMs,
    max: config.maxRequests,
    message: {
      success: false,
      error: 'Muitas requisições. Tente novamente mais tarde.',
      retryAfter: Math.ceil(config.windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: 'Muitas requisições. Tente novamente mais tarde.',
        retryAfter: Math.ceil(config.windowMs / 1000)
      });
    }
  });
}; 