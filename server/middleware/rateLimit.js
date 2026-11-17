import { rateLimit } from 'express-rate-limit';
import config from '../config/env.js';

const factor = config.isProd ? 1 : 20;

const make = ({ windowMs, limit, message, skipSuccessfulRequests = false }) =>
  rateLimit({
    windowMs,
    limit: limit * factor,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skipSuccessfulRequests,
    message: { success: false, message },
  });

export const globalLimiter = make({
  windowMs: 15 * 60 * 1000,
  limit: 400,
  message: 'Too many requests from this address. Please slow down.',
});

export const authLimiter = make({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  message: 'Too many sign-in attempts. Please try again in a few minutes.',
  skipSuccessfulRequests: true,
});

export const writeLimiter = make({
  windowMs: 15 * 60 * 1000,
  limit: 150,
  message: 'Too many changes in a short time. Please wait a moment.',
});

export const checkoutLimiter = make({
  windowMs: 10 * 60 * 1000,
  limit: 25,
  message: 'Too many checkout attempts. Please wait a few minutes.',
});
