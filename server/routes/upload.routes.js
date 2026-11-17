import { Router } from 'express';
import { uploadImages } from '../controllers/upload.controller.js';
import { protect } from '../middleware/auth.js';
import { uploadMultiple } from '../middleware/upload.js';

const router = Router();

router.post('/', protect, uploadMultiple('images', 6), uploadImages);

export default router;
