import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import User from '../models/User.js';
import Store from '../models/Store.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const extractToken = (req) => {
  if (req.cookies?.[config.cookieName]) return req.cookies[config.cookieName];
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return null;
};

const resolveUser = async (token) => {
  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') throw ApiError.unauthorized('Your session has expired. Please sign in again.');
    throw ApiError.unauthorized('Invalid session. Please sign in again.');
  }
  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('This account no longer exists');
  if (!user.isActive) throw ApiError.forbidden('Your account has been suspended. Contact support.');
  return user;
};

/** Requires a signed-in user. */
export const protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw ApiError.unauthorized();
  req.user = await resolveUser(token);
  next();
});

/** Attaches the user when a session exists, but never blocks the request. */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();
  try {
    req.user = await resolveUser(token);
  } catch {
    req.user = undefined;
  }
  return next();
});

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) {
    return next(ApiError.forbidden('Your account role cannot access this resource'));
  }
  return next();
};

/** Sellers must have an approved store to manage catalogue and orders. */
export const requireApprovedSeller = asyncHandler(async (req, res, next) => {
  if (req.user.role !== 'seller') throw ApiError.forbidden('Seller account required');
  const store = await Store.findOne({ owner: req.user._id });
  if (!store) throw ApiError.forbidden('Create your store before continuing');
  if (store.status !== 'approved') {
    throw ApiError.forbidden('Your store is pending approval by the VELORA team');
  }
  req.store = store;
  next();
});

export default protect;
