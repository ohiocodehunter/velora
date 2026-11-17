import { Router } from 'express';
import {
  placeOrder,
  myOrders,
  getOrder,
  trackOrder,
  cancelMyOrder,
  reorder,
} from '../controllers/order.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createOrderSchema, cancelOrderSchema } from '../validators/order.validator.js';
import { checkoutLimiter } from '../middleware/rateLimit.js';

const router = Router();
router.use(protect);

router.post('/', checkoutLimiter, validate({ body: createOrderSchema }), placeOrder);
router.get('/', myOrders);
router.get('/:id', getOrder);
router.get('/:id/track', trackOrder);
router.post('/:id/cancel', validate({ body: cancelOrderSchema }), cancelMyOrder);
router.get('/:id/reorder', reorder);

export default router;
