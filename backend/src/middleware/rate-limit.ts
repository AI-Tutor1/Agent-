import rateLimit from 'express-rate-limit';

// Dashboard APIs: 100 requests/minute per IP
export const dashboardLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — dashboard API limit is 100/min' },
});

// Agent APIs: 60 requests/minute per IP
export const agentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — agent API limit is 60/min' },
});

// Sync endpoints: 4 requests/hour per IP
export const syncLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 4,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — sync API limit is 4/hour' },
});

// Webhook endpoints: 10 requests/minute per IP
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — webhook API limit is 10/min' },
});

// Auth endpoints: 20 requests/15-minute window per IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts — try again in 15 minutes' },
});
