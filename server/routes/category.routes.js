import { Router } from 'express';
import {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { categorySchema, categoryUpdateSchema } from '../validators/catalog.validator.js';

const router = Router();

router.get('/', optionalAuth, listCategories);
router.get('/:slug', getCategory);
router.post('/', protect, authorize('admin'), validate({ body: categorySchema }), createCategory);
router.patch('/:id', protect, authorize('admin'), validate({ body: categoryUpdateSchema }), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

export default router;
