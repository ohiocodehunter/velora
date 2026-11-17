import Banner from '../models/Banner.js';
import Category from '../models/Category.js';
import ContactMessage from '../models/ContactMessage.js';
import Coupon from '../models/Coupon.js';
import Newsletter from '../models/Newsletter.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Store from '../models/Store.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created, message } from '../utils/response.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import { adminDashboard } from '../services/analytics.service.js';
import { cancelOrder } from '../services/order.service.js';
import { computeOrderStatus } from '../utils/orderStatus.js';
import { notify } from '../services/notification.service.js';
import { sendSellerDecisionEmail } from '../services/email.service.js';
import { ORDER_STATUS_LABELS } from '../utils/constants.js';
import { recomputeProductRating } from './review.controller.js';

export const dashboard = asyncHandler(async (req, res) => {
  return ok(res, await adminDashboard());
});

/* ------------------------------- users ---------------------------------- */

export const listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 10 });
  const filter = {};
  if (req.query.role && ['customer', 'seller', 'admin'].includes(req.query.role)) filter.role = req.query.role;
  if (req.query.q) {
    const rx = new RegExp(String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: rx }, { email: rx }];
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort('-createdAt').skip(skip).limit(limit).populate('store', 'name slug status'),
    User.countDocuments(filter),
  ]);
  return ok(res, users, paginationMeta(total, { page, limit }));
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === 'admin' && user._id.equals(req.user._id)) {
    throw ApiError.badRequest('You cannot change your own admin account here');
  }

  if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
  if (req.body.role && ['customer', 'seller', 'admin'].includes(req.body.role)) {
    if (user.role === 'seller' && req.body.role !== 'seller') {
      await Store.updateOne({ owner: user._id }, { $set: { status: 'suspended' } });
      user.store = null;
    }
    user.role = req.body.role;
  }
  await user.save();
  return ok(res, user);
});

/* ------------------------------- sellers -------------------------------- */

export const listSellers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 10 });
  const filter = {};
  if (req.query.status && ['pending', 'approved', 'rejected', 'suspended'].includes(req.query.status)) {
    filter.status = req.query.status;
  }
  const [stores, total] = await Promise.all([
    Store.find(filter).sort('status createdAt').skip(skip).limit(limit).populate('owner', 'name email phone createdAt isActive'),
    Store.countDocuments(filter),
  ]);
  return ok(res, stores, paginationMeta(total, { page, limit }));
});

export const updateSellerStatus = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id).populate('owner');
  if (!store) throw ApiError.notFound('Store not found');
  if (!store.owner) throw ApiError.badRequest('This store has no owner account');

  const { status, reason = '' } = req.body;
  const owner = await User.findById(store.owner._id);

  if (status === 'approved') {
    store.status = 'approved';
    store.rejectionReason = '';
    owner.role = 'seller';
    owner.sellerStatus = 'approved';
    owner.store = store._id;
  } else if (status === 'rejected') {
    store.status = 'rejected';
    store.rejectionReason = reason;
    owner.sellerStatus = 'rejected';
    if (owner.role === 'seller') owner.role = 'customer';
    owner.store = null;
  } else if (status === 'suspended') {
    store.status = 'suspended';
    owner.sellerStatus = 'rejected';
  } else if (status === 'pending') {
    store.status = 'pending';
    owner.sellerStatus = 'pending';
  } else {
    throw ApiError.badRequest('Unknown seller status');
  }

  await store.save();
  await owner.save();

  sendSellerDecisionEmail(owner, store, status === 'approved', reason).catch(() => {});
  await notify(owner._id, {
    type: 'seller',
    title:
      status === 'approved'
        ? `${store.name} is approved`
        : status === 'suspended'
          ? `${store.name} has been suspended`
          : `Update on ${store.name}`,
    message:
      status === 'approved'
        ? 'You can now list products and manage orders.'
        : reason || 'Contact support if you have questions.',
    link: status === 'approved' ? '/seller' : '/seller/apply',
  });

  return ok(res, store);
});

/* ------------------------------- products ------------------------------- */

export const listAllProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 10 });
  const filter = {};
  if (req.query.status && ['draft', 'active', 'archived'].includes(req.query.status)) filter.status = req.query.status;
  if (req.query.q) filter.name = new RegExp(String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  if (req.query.reported === 'true') filter.isReported = true;

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('store', 'name slug status')
      .populate('seller', 'name email')
      .populate('category', 'name'),
    Product.countDocuments(filter),
  ]);
  return ok(res, products, paginationMeta(total, { page, limit }));
});

export const updateProductAdmin = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');

  if (req.body.status) product.status = req.body.status;
  if (req.body.isFeatured !== undefined) product.isFeatured = req.body.isFeatured;
  if (req.body.isReported !== undefined) product.isReported = req.body.isReported;
  await product.save();
  return ok(res, product);
});

export const deleteProductAdmin = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw ApiError.notFound('Product not found');
  await Store.updateOne({ _id: product.store, productCount: { $gt: 0 } }, { $inc: { productCount: -1 } });
  return message(res, 'Product deleted');
});

/* -------------------------------- orders -------------------------------- */

export const listOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 10 });
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.q) {
    const rx = new RegExp(String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ orderNumber: rx }, { 'shippingAddress.fullName': rx }, { 'shippingAddress.phone': rx }];
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .select('orderNumber status payment summary createdAt shippingAddress user items')
      .populate('user', 'name email'),
    Order.countDocuments(filter),
  ]);
  return ok(res, orders, paginationMeta(total, { page, limit }));
});

export const getOrderAdmin = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('items.store', 'name')
    .populate('items.seller', 'name email');
  if (!order) throw ApiError.notFound('Order not found');
  return ok(res, order);
});

export const updateOrderStatusAdmin = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw ApiError.notFound('Order not found');
  const { status, note = '' } = req.body;

  if (status === 'cancelled') {
    const cancelled = await cancelOrder(order, { user: req.user, role: 'admin', reason: note });
    return ok(res, cancelled);
  }
  if (!Object.keys(ORDER_STATUS_LABELS).includes(status)) throw ApiError.badRequest('Unknown status');

  order.items.forEach((item) => {
    if (item.status !== 'cancelled') {
      item.status = status;
      item.statusHistory.push({ status, note: note || 'Updated by VELORA', at: new Date(), by: req.user._id });
    }
  });
  order.status = computeOrderStatus(order.items);
  order.statusHistory.push({ status, note: note || 'Updated by VELORA', at: new Date(), by: req.user._id });
  if (status === 'delivered') order.deliveredAt = new Date();
  await order.save();

  await notify(order.user, {
    type: 'order',
    title: `Order ${order.orderNumber} updated`,
    message: `Status changed to ${ORDER_STATUS_LABELS[order.status] || order.status}.`,
    link: `/orders/${order._id}`,
  });

  return ok(res, order);
});

/* -------------------------------- coupons ------------------------------- */

export const listCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  return ok(res, coupons);
});

export const createCoupon = asyncHandler(async (req, res) => {
  const code = req.body.code.toUpperCase();
  if (await Coupon.exists({ code })) throw ApiError.conflict('A coupon with this code already exists');
  const coupon = await Coupon.create({ ...req.body, code });
  return created(res, coupon);
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) throw ApiError.notFound('Coupon not found');
  Object.assign(coupon, req.body);
  if (req.body.code) coupon.code = req.body.code.toUpperCase();
  await coupon.save();
  return ok(res, coupon);
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) throw ApiError.notFound('Coupon not found');
  return message(res, 'Coupon deleted');
});

/* -------------------------------- banners ------------------------------- */

export const listBannersAdmin = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort('position sortOrder -createdAt');
  return ok(res, banners);
});

export const createBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.create(req.body);
  return created(res, banner);
});

export const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!banner) throw ApiError.notFound('Banner not found');
  return ok(res, banner);
});

export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndDelete(req.params.id);
  if (!banner) throw ApiError.notFound('Banner not found');
  return message(res, 'Banner deleted');
});

export const publicBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({
    isActive: true,
    startsAt: { $lte: new Date() },
    $or: [{ endsAt: null }, { endsAt: { $gt: new Date() } }],
    ...(req.query.position ? { position: req.query.position } : {}),
  }).sort('position sortOrder -createdAt');
  return ok(res, banners);
});

/* -------------------------------- reviews ------------------------------- */

export const listReviewsAdmin = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 10 });
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.reported === 'true') filter.status = 'reported';

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('user', 'name email')
      .populate('product', 'name slug images'),
    Review.countDocuments(filter),
  ]);
  return ok(res, reviews, paginationMeta(total, { page, limit }));
});

export const moderateReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw ApiError.notFound('Review not found');
  if (!['visible', 'hidden'].includes(req.body.status)) throw ApiError.badRequest('Unknown review status');

  review.status = req.body.status;
  await review.save();
  await recomputeProductRating(review.product);
  return ok(res, review);
});

export const deleteReviewAdmin = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndDelete(req.params.id);
  if (!review) throw ApiError.notFound('Review not found');
  await recomputeProductRating(review.product);
  return message(res, 'Review deleted');
});

/* ---------------------------- messages / lists -------------------------- */

export const listMessages = asyncHandler(async (req, res) => {
  const messages = await ContactMessage.find().sort('-createdAt').limit(100);
  return ok(res, messages);
});

export const updateMessage = asyncHandler(async (req, res) => {
  const msg = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true },
  );
  if (!msg) throw ApiError.notFound('Message not found');
  return ok(res, msg);
});

export const listSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await Newsletter.find({ isActive: true }).sort('-createdAt');
  return ok(res, subscribers);
});

export const listCategoriesAdmin = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort('sortOrder name');
  return ok(res, categories);
});

export default { dashboard };
