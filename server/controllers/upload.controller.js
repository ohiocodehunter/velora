import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import ApiError from '../utils/ApiError.js';
import { storeUploads } from '../services/upload.service.js';

export const uploadImages = asyncHandler(async (req, res) => {
  const files = req.files?.length ? req.files : req.file ? [req.file] : [];
  if (!files.length) throw ApiError.badRequest('Choose at least one image');

  const folder = req.query.folder === 'avatars' ? 'velora/avatars' : req.query.folder === 'banners' ? 'velora/banners' : 'velora/products';
  const images = await storeUploads(files, { folder });
  return ok(res, { images });
});

export default { uploadImages };
