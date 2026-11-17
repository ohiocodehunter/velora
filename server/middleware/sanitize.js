import config from '../config/env.js';
import ApiError from '../utils/ApiError.js';

const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/** Removes keys starting with "$" or containing "." to block operator injection. */
export const stripOperators = (value) => {
  if (Array.isArray(value)) return value.map(stripOperators);
  if (!isPlainObject(value)) return value;
  const clean = {};
  for (const [key, val] of Object.entries(value)) {
    if (key.startsWith('$') || key.includes('.')) continue;
    clean[key] = stripOperators(val);
  }
  return clean;
};

/**
 * express-mongo-sanitize is incompatible with Express 5 (req.query is a
 * getter-only accessor), so body and route params are cleaned here and query
 * strings are only ever read through explicit field allowlists in controllers.
 */
export const sanitizeRequest = (req, res, next) => {
  if (req.body && typeof req.body === 'object') req.body = stripOperators(req.body);
  if (req.params && typeof req.params === 'object') req.params = stripOperators(req.params);
  next();
};

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/** Blocks cross-site state-changing requests when a browser Origin is present. */
export const originCheck = (req, res, next) => {
  if (SAFE_METHODS.includes(req.method)) return next();
  const origin = req.headers.origin;
  if (!origin) return next(); // curl, server-to-server, smoke tests
  const allowed = config.allowedOrigins;
  if (allowed.includes(origin)) return next();
  return next(ApiError.forbidden('Cross-site request blocked'));
};

export default sanitizeRequest;
