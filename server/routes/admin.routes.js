import { Router } from 'express';
import {
  dashboard,
  listUsers,
  updateUser,
  listSellers,
  updateSellerStatus,
  listAllProducts,
  updateProductAdmin,
  deleteProductAdmin,
  listOrders,
  getOrderAdmin,
  updateOrderStatusAdmin,
  listCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  listBannersAdmin,
  createBanner,
  updateBanner,
  deleteBanner,
  listReviewsAdmin,
  moderateReview,
  deleteReviewAdmin,
  listMessages,
  updateMessage,
  listSubscribers,
  listCategoriesAdmin,
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { couponSchema, bannerSchema } from '../validators/order.validator.js';

const router = Router();
router.use(protect, authorize('admin'));

router.get('/dashboard', dashboard);

router.get('/users', listUsers);
router.patch('/users/:id', updateUser);

router.get('/sellers', listSellers);
router.patch('/sellers/:id/status', updateSellerStatus);

router.get('/products', listAllProducts);
router.patch('/products/:id', updateProductAdmin);
router.delete('/products/:id', deleteProductAdmin);

router.get('/orders', listOrders);
router.get('/orders/:id', getOrderAdmin);
router.patch('/orders/:id/status', updateOrderStatusAdmin);

router.get('/categories', listCategoriesAdmin);

router.get('/coupons', listCoupons);
router.post('/coupons', validate({ body: couponSchema }), createCoupon);
router.patch('/coupons/:id', validate({ body: couponSchema.partial() }), updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

router.get('/banners', listBannersAdmin);
router.post('/banners', validate({ body: bannerSchema }), createBanner);
router.patch('/banners/:id', validate({ body: bannerSchema.partial() }), updateBanner);
router.delete('/banners/:id', deleteBanner);

router.get('/reviews', listReviewsAdmin);
router.patch('/reviews/:id', moderateReview);
router.delete('/reviews/:id', deleteReviewAdmin);

router.get('/messages', listMessages);
router.patch('/messages/:id', updateMessage);
router.get('/subscribers', listSubscribers);

export default router;
