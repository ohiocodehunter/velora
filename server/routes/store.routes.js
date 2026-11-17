import { Router } from 'express';
import {
  listStores,
  getStore,
  myStore,
  applyForStore,
  updateMyStore,
  storeReviews,
} from '../controllers/store.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sellerApplySchema } from '../validators/auth.validator.js';
import { storeUpdateSchema } from '../validators/catalog.validator.js';

const router = Router();

router.get('/', listStores);
router.get('/mine', protect, myStore);
router.post('/apply', protect, validate({ body: sellerApplySchema }), applyForStore);
router.patch('/mine', protect, authorize('seller'), validate({ body: storeUpdateSchema }), updateMyStore);
router.get('/:slug/reviews', storeReviews);
router.get('/:slug', getStore);

export default router;
