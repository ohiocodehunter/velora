import { Router } from 'express';
import {
  dashboard,
  analytics,
  sellerOrders,
  sellerOrder,
  updateItemStatus,
  cancelSellerOrder,
  inventory,
  updateStock,
} from '../controllers/seller.controller.js';
import { sellerReviews } from '../controllers/review.controller.js';
import { protect, authorize, requireApprovedSeller } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sellerStatusSchema, cancelOrderSchema } from '../validators/order.validator.js';

const router = Router();

router.use(protect, authorize('seller'), requireApprovedSeller);

router.get('/dashboard', dashboard);
router.get('/analytics', analytics);
router.get('/orders', sellerOrders);
router.get('/orders/:orderId', sellerOrder);
router.patch(
  '/orders/:orderId/items/:itemId/status',
  validate({ body: sellerStatusSchema }),
  updateItemStatus,
);
router.post('/orders/:orderId/cancel', validate({ body: cancelOrderSchema }), cancelSellerOrder);
router.get('/reviews', sellerReviews);
router.get('/inventory', inventory);
router.patch('/inventory/:id', updateStock);

export default router;
