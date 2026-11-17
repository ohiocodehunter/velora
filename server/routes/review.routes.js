import { Router } from 'express';
import {
  productReviews,
  createReview,
  updateReview,
  deleteReview,
  reportReview,
  myReviews,
} from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { reviewSchema } from '../validators/order.validator.js';

const router = Router();

router.get('/product/:productId', productReviews);
router.get('/mine', protect, myReviews);
router.post('/', protect, validate({ body: reviewSchema }), createReview);
router.patch('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/report', protect, reportReview);

export default router;
