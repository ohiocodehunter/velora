import multer from 'multer';
import config from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';
  let errors = err.errors;

  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 422;
    message = 'Please check the submitted values';
    errors = Object.fromEntries(Object.entries(err.errors).map(([key, value]) => [key, value.message]));
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  } else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `That ${field} is already in use`;
    errors = { [field]: `That ${field} is already in use` };
  } else if (err instanceof multer.MulterError) {
    statusCode = 400;
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Each image must be 5 MB or smaller' : err.message;
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'Request body is not valid JSON';
  }

  if (statusCode >= 500) logger.error(err.stack || err);
  else logger.warn(`${statusCode} ${req.method} ${req.originalUrl} — ${message}`);

  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  if (!config.isProd && statusCode >= 500) payload.stack = err.stack;

  res.status(statusCode).json(payload);
};

export default errorHandler;
