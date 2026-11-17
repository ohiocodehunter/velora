import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/error.js';
import { globalLimiter } from './middleware/rateLimit.js';
import { sanitizeRequest, originCheck } from './middleware/sanitize.js';
import logger from './utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: config.isProd ? undefined : false,
  }),
);

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin requests and server-to-server tools send no Origin header.
      if (!origin || config.allowedOrigins.includes(origin)) return callback(null, true);
      logger.warn(`Blocked CORS origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  }),
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(compression());
app.use(morgan(config.isProd ? 'combined' : 'dev'));

app.use(sanitizeRequest);
app.use(originCheck);
app.use('/api', globalLimiter);

app.use('/uploads', express.static(config.uploadDir, { maxAge: '7d', fallthrough: true }));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      env: config.nodeEnv,
      time: new Date().toISOString(),
      providers: {
        cloudinary: Boolean(config.cloudinary.cloudName),
        razorpay: Boolean(config.razorpay.keyId),
        smtp: Boolean(config.smtp.host),
      },
    },
  });
});

app.use('/api', routes);

// Serve the built React app when running in production mode.
const clientDist = path.resolve(__dirname, '../client/dist');
if (config.isProd && fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
    return res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
