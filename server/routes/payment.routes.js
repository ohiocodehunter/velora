import { Router } from 'express';
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  paymentStatus,
} from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { verifyPaymentSchema } from '../validators/order.validator.js';
import { checkoutLimiter } from '../middleware/rateLimit.js';

const router = Router();
router.use(protect);

router.post('/razorpay/verify', checkoutLimiter, validate({ body: verifyPaymentSchema }), verifyRazorpayPayment);
router.post('/razorpay/:orderId', checkoutLimiter, createRazorpayOrder);
router.get('/status/:orderId', paymentStatus);

export default router;
