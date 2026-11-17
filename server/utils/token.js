import jwt from 'jsonwebtoken';
import config from '../config/env.js';

export function signToken(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: config.isProd ? 'none' : 'lax',
    secure: config.cookieSecure,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

export function setAuthCookie(res, token) {
  res.cookie(config.cookieName, token, cookieOptions());
}

export function clearAuthCookie(res) {
  res.clearCookie(config.cookieName, { ...cookieOptions(), maxAge: undefined });
}
