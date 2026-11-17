import fs from 'node:fs/promises';
import cloudinary, { cloudinaryEnabled } from '../config/cloudinary.js';
import config from '../config/env.js';
import logger from '../utils/logger.js';

/**
 * Stores uploaded images. With Cloudinary credentials the file is streamed to
 * the cloud and the local temp copy removed; otherwise it stays in server/uploads
 * and is served from /uploads — no code changes needed to switch.
 */
export async function storeUploads(files = [], { folder = 'velora/products' } = {}) {
  const list = Array.isArray(files) ? files : [files];
  const results = [];

  for (const file of list) {
    if (!file) continue;
    if (cloudinaryEnabled) {
      try {
        const uploaded = await cloudinary.uploader.upload(file.path, {
          folder,
          resource_type: 'image',
        });
        await fs.unlink(file.path).catch(() => {});
        results.push({ url: uploaded.secure_url, publicId: uploaded.public_id });
        continue;
      } catch (error) {
        logger.warn('Cloudinary upload failed, keeping local file:', error.message);
      }
    }
    results.push({
      url: `${config.publicUrl}/uploads/${file.filename}`,
      publicId: '',
    });
  }
  return results;
}

export async function storeUpload(file, options) {
  const [result] = await storeUploads([file], options);
  return result;
}

export default storeUploads;
