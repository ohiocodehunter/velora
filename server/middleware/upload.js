import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import config from '../config/env.js';

fs.mkdirSync(config.uploadDir, { recursive: true });

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, config.uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED.includes(file.mimetype)) {
    return cb(new Error('Only JPG, PNG, WEBP, AVIF or GIF images are allowed'));
  }
  return cb(null, true);
};

const uploader = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
});

export const uploadSingle = (field = 'image') => uploader.single(field);
export const uploadMultiple = (field = 'images', maxCount = 6) => uploader.array(field, maxCount);

export default uploader;
