import { Router } from 'express';
import {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  applyCoupon,
  removeCoupon,
  listCoupons,
} from '../controllers/cart.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  cartItemSchema,
  cartQuantitySchema,
  couponCodeSchema,
} from '../validators/order.validator.js';
import { writeLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.use(protect);

router.get('/', getCart);
router.post('/items', writeLimiter, validate({ body: cartItemSchema }), addItem);
router.patch('/items/:itemId', validate({ body: cartQuantitySchema }), updateItem);
router.delete('/items/:itemId', removeItem);
router.delete('/', clearCart);
router.post('/coupon', validate({ body: couponCodeSchema }), applyCoupon);
router.delete('/coupon', removeCoupon);
router.get('/coupons', listCoupons);

export default router;
