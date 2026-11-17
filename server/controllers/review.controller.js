import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created, message } from '../utils/response.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import { notify } from '../services/notification.service.js';

export async function recomputeProductRating(productId) {
  const [agg] = await Review.aggregate([
    { $match: { product: productId, status: 'visible' } },
    { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Product.updateOne(
    { _id: productId },
    {
      $set: {
        ratingAverage: agg ? Math.round(agg.average * 10) / 10 : 0,
        ratingCount: agg?.count || 0,
      },
    },
  );
}

export const productReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 10 });
  const filter = { product: req.params.productId, status: 'visible' };

  const [reviews, total, breakdown] = await Promise.all([
    Review.find(filter).sort('-createdAt').skip(skip).limit(limit).populate('user', 'name avatar'),
    Review.countDocuments(filter),
    Review.aggregate([
      { $match: filter },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]),
  ]);

  return ok(res, { reviews, breakdown }, paginationMeta(total, { page, limit }));
});

export const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, title = '', body, orderId } = req.body;

  const product = await Product.findById(productId).select('name seller store');
  if (!product) throw ApiError.notFound('Product not found');

  const existing = await Review.exists({ product: productId, user: req.user._id });
  if (existing) throw ApiError.conflict('You have already reviewed this product');

  // Verified purchase = a delivered order containing the product.
  const deliveredOrder = await Order.findOne({
    user: req.user._id,
    'items.product': productId,
    'items.status': 'delivered',
    ...(orderId ? { _id: orderId } : {}),
  }).select('_id');

  const review = await Review.create({
    product: productId,
    seller: product.seller,
    user: req.user._id,
    order: deliveredOrder?._id || null,
    rating,
    title,
    body,
    isVerifiedPurchase: Boolean(deliveredOrder),
  });

  await recomputeProductRating(product._id);
  await notify(product.seller, {
    type: 'review',
    title: 'New product review',
    message: `${req.user.name} rated ${product.name} ${rating}/5.`,
    link: '/seller/reviews',
  });

  const populated = await review.populate('user', 'name avatar');
  return created(res, populated);
});

export const updateReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
  if (!review) throw ApiError.notFound('Review not found');

  review.rating = req.body.rating ?? review.rating;
  review.title = req.body.title ?? review.title;
  review.body = req.body.body ?? review.body;
  await review.save();
  await recomputeProductRating(review.product);
  return ok(res, review);
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
  if (!review) throw ApiError.notFound('Review not found');

  await review.deleteOne();
  await recomputeProductRating(review.product);
  return message(res, 'Review removed');
});

export const reportReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { $inc: { reportCount: 1 }, status: 'reported', reportReason: String(req.body.reason || '').slice(0, 300) },
    { new: true },
  );
  if (!review) throw ApiError.notFound('Review not found');
  return message(res, 'Thanks — our moderators will take a look');
});

export const myReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id })
    .sort('-createdAt')
    .populate('product', 'name slug images');
  return ok(res, reviews);
});

export const sellerReviews = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 10 });
  const filter = { seller: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [reviews, total] = await Promise.all([
    Review.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('user', 'name avatar')
      .populate('product', 'name slug images'),
    Review.countDocuments(filter),
  ]);
  return ok(res, reviews, paginationMeta(total, { page, limit }));
});

export default { productReviews, createReview };
