import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const env = process.env;
// Some sandboxes export PORT=0 (ephemeral); fall back to the project default.
const envPort = Number(env.PORT);
const port = Number.isFinite(envPort) && envPort > 0 ? envPort : 4000;
const bool = (value, fallback = false) =>
  value === undefined ? fallback : ['1', 'true', 'yes'].includes(String(value).toLowerCase());

export const config = {
  nodeEnv: env.NODE_ENV || 'development',
  isProd: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  port,
  clientUrl: env.CLIENT_URL || 'http://localhost:5173',
  allowedOrigins: (env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  mongoUri: env.MONGODB_URI || '',
  jwtSecret: env.JWT_SECRET || 'velora-dev-secret-change-in-production',
  jwtExpiresIn: env.JWT_EXPIRES_IN || '7d',
  cookieName: env.COOKIE_NAME || 'velora_token',
  cookieSecure: bool(env.COOKIE_SECURE, env.NODE_ENV === 'production'),
  uploadDir: path.resolve(__dirname, '../uploads'),
  publicUrl: env.PUBLIC_URL || `http://localhost:${port}`,
  cloudinary: {
    cloudName: env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: env.CLOUDINARY_API_KEY || '',
    apiSecret: env.CLOUDINARY_API_SECRET || '',
  },
  razorpay: {
    keyId: env.RAZORPAY_KEY_ID || '',
    keySecret: env.RAZORPAY_KEY_SECRET || '',
  },
  smtp: {
    host: env.SMTP_HOST || '',
    port: Number(env.SMTP_PORT || 587),
    secure: bool(env.SMTP_SECURE, false),
    user: env.SMTP_USER || '',
    pass: env.SMTP_PASS || '',
    from: env.MAIL_FROM || 'VELORA <no-reply@velora.shop>',
  },
  admin: {
    email: env.ADMIN_EMAIL || 'admin@velora.shop',
    password: env.ADMIN_PASSWORD || 'Admin@12345',
  },
  seed: {
    password: env.SEED_PASSWORD || 'Velora@123',
  },
  shipping: {
    freeAbove: Number(env.FREE_SHIPPING_THRESHOLD || 999),
    fee: Number(env.SHIPPING_FEE || 79),
    taxRate: Number(env.TAX_RATE || 0.05),
  },
};

export default config;
