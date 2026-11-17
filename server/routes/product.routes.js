import { Router } from 'express';
import {
  listProducts,
  productFacets,
  getProduct,
  relatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  sellerProducts,
  reportProduct,
} from '../controllers/product.controller.js';
import { protect, authorize, requireApprovedSeller } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { productSchema, productUpdateSchema } from '../validators/catalog.validator.js';
import { writeLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.get('/', listProducts);
router.get('/facets', productFacets);
router.get('/seller/mine', protect, authorize('seller'), sellerProducts);
router.get('/:slug', getProduct);
router.get('/:slug/related', relatedProducts);

router.post(
  '/',
  protect,
  authorize('seller'),
  requireApprovedSeller,
  writeLimiter,
  validate({ body: productSchema }),
  createProduct,
);
router.patch(
  '/:id',
  protect,
  authorize('seller'),
  requireApprovedSeller,
  validate({ body: productUpdateSchema }),
  updateProduct,
);
router.delete('/:id', protect, authorize('seller'), requireApprovedSeller, deleteProduct);
router.post('/:id/report', protect, reportProduct);

export default router;
