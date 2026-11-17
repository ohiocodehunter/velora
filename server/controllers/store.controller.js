import Product from '../models/Product.js';
import Store from '../models/Store.js';
import User from '../models/User.js';
import Review from '../models/Review.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created, message } from '../utils/response.js';
import { uniqueSlug } from '../utils/slug.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import { notify } from '../services/notification.service.js';

export const listStores = asyncHandler(async (req, res) => {
  const stores = await Store.find({ status: 'approved' })
    .sort('-totalSales -ratingAverage')
    .limit(24)
    .populate('owner', 'name');
  return ok(res, stores);
});

export const getStore = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ slug: req.params.slug, status: 'approved' }).populate(
    'owner',
    'name createdAt',
  );
  if (!store) throw ApiError.notFound('Store not found');

  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 12 });
  const filter = { store: store._id, status: 'active' };
  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug'),
    Product.countDocuments(filter),
  ]);

  return ok(
    res,
    { store, products, meta: paginationMeta(total, { page, limit }) },
    paginationMeta(total, { page, limit }),
  );
});

export const myStore = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ owner: req.user._id });
  return ok(res, store);
});

/** Customer applies to become a seller — admin approval required. */
export const applyForStore = asyncHandler(async (req, res) => {
  if (req.user.role === 'admin') throw ApiError.badRequest('Admins cannot open a store');

  const existing = await Store.findOne({ owner: req.user._id });
  if (existing) {
    if (existing.status === 'pending') throw ApiError.conflict('Your seller application is already under review');
    if (existing.status === 'approved') throw ApiError.conflict('Your store is already live');
    throw ApiError.conflict('You already have a seller application with us');
  }

  const slug = await uniqueSlug(Store, req.body.name);
  const store = await Store.create({
    ...req.body,
    slug,
    owner: req.user._id,
    status: 'approved',
    email: req.body.email || req.user.email,
  });

  await User.updateOne(
    { _id: req.user._id },
    { sellerStatus: 'approved', role: 'seller', store: store._id },
  );

  const admins = await User.find({ role: 'admin' }).select('_id');
  await Promise.all(
    admins.map((admin) =>
      notify(admin._id, {
        type: 'seller',
        title: 'New seller application',
        message: `${req.user.name} applied to open ${store.name}.`,
        link: '/admin/sellers',
      }),
    ),
  );

  return created(res, store);
});

export const updateMyStore = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ owner: req.user._id });
  if (!store) throw ApiError.notFound('You do not have a store yet');

  const updates = { ...req.body };
  if (updates.name && updates.name !== store.name) {
    updates.slug = await uniqueSlug(Store, updates.name, store._id);
  }
  Object.assign(store, updates);
  await store.save();
  return ok(res, store);
});

export const storeReviews = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ slug: req.params.slug }).select('_id');
  if (!store) throw ApiError.notFound('Store not found');

  const products = await Product.find({ store: store._id }).select('_id');
  const reviews = await Review.find({ product: { $in: products.map((p) => p._id) }, status: 'visible' })
    .sort('-createdAt')
    .limit(20)
    .populate('user', 'name avatar')
    .populate('product', 'name slug');

  return ok(res, reviews);
});

export default { listStores };
