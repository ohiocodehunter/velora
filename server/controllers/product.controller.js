import Category from '../models/Category.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Store from '../models/Store.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created, message } from '../utils/response.js';
import { getPagination, paginationMeta, parseSort } from '../utils/pagination.js';
import { uniqueSlug } from '../utils/slug.js';
import { notify } from '../services/notification.service.js';

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const SORTABLE = ['createdAt', 'finalPrice', 'price', 'ratingAverage', 'soldCount', 'name'];

const publicPopulate = [
  { path: 'category', select: 'name slug' },
  { path: 'store', select: 'name slug logo status' },
  { path: 'seller', select: 'name' },
];

/** Builds the Mongo filter for the public catalogue from query parameters. */
export function buildProductFilter(query, { includeInactive = false } = {}) {
  const filter = {};
  if (!includeInactive) filter.status = 'active';

  if (query.q) {
    const rx = new RegExp(escapeRegex(query.q.trim()), 'i');
    filter.$or = [{ name: rx }, { brand: rx }, { tags: rx }, { description: rx }];
  }
  if (query.category) {
    filter.category = /^[0-9a-fA-F]{24}$/.test(query.category)
      ? query.category
      : query.category; // slug is resolved by the controller before calling
  }
  if (query.brand) filter.brand = new RegExp(`^${escapeRegex(query.brand)}$`, 'i');
  if (query.seller) filter.seller = query.seller;
  if (query.store) filter.store = query.store;
  if (query.featured === 'true') filter.isFeatured = true;
  if (query.inStock === 'true') filter.stock = { $gt: 0 };

  const min = Number(query.minPrice);
  const max = Number(query.maxPrice);
  if (query.minPrice !== undefined && Number.isFinite(min)) filter.finalPrice = { ...(filter.finalPrice || {}), $gte: min };
  if (query.maxPrice !== undefined && Number.isFinite(max)) filter.finalPrice = { ...(filter.finalPrice || {}), $lte: max };
  if (query.minRating) filter.ratingAverage = { $gte: Number(query.minRating) };

  return filter;
}

export const listProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 12 });
  const filter = buildProductFilter(req.query);

  if (req.query.category && !/^[0-9a-fA-F]{24}$/.test(req.query.category)) {
    const category = await Category.findOne({ slug: req.query.category });
    if (!category) throw ApiError.notFound('Category not found');
    filter.category = category._id;
  }
  if (req.query.storeSlug) {
    const store = await Store.findOne({ slug: req.query.storeSlug, status: 'approved' });
    if (!store) throw ApiError.notFound('Store not found');
    filter.store = store._id;
  }

  // Products from suspended or unapproved stores are never listed publicly.
  if (!filter.store) {
    const approvedStores = await Store.find({ status: 'approved' }).select('_id').lean();
    filter.store = { $in: approvedStores.map((store) => store._id) };
  }

  const sort = parseSort(req.query.sort, SORTABLE, '-createdAt');

  const [items, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).populate(publicPopulate),
    Product.countDocuments(filter),
  ]);

  return ok(res, items, paginationMeta(total, { page, limit }));
});

export const productFacets = asyncHandler(async (req, res) => {
  const match = { status: 'active' };
  if (req.query.category) match.category = req.query.category;

  const [brands, priceAgg, categories] = await Promise.all([
    Product.distinct('brand', match),
    Product.aggregate([
      { $match: match },
      { $group: { _id: null, min: { $min: '$finalPrice' }, max: { $max: '$finalPrice' } } },
    ]),
    Category.find({ isActive: true }).select('name slug image').sort('sortOrder name'),
  ]);

  return ok(res, {
    brands: brands.filter(Boolean).sort(),
    priceRange: { min: priceAgg[0]?.min || 0, max: priceAgg[0]?.max || 0 },
    categories,
  });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).populate(publicPopulate);
  if (!product || product.status !== 'active') throw ApiError.notFound('Product not found');
  if (product.store && product.store.status !== 'approved') {
    throw ApiError.notFound('This product is not available right now');
  }

  const reviews = await Review.find({ product: product._id, status: 'visible' })
    .sort('-createdAt')
    .limit(10)
    .populate('user', 'name avatar');

  return ok(res, { product, reviews });
});

export const relatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug }).select('category _id');
  if (!product) throw ApiError.notFound('Product not found');

  const items = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    status: 'active',
  })
    .sort('-ratingAverage -soldCount')
    .limit(8)
    .populate(publicPopulate);

  return ok(res, items);
});

export const createProduct = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.body.category, isActive: true });
  if (!category) throw ApiError.badRequest('Choose a valid category');

  if (req.body.discountPrice && Number(req.body.discountPrice) >= Number(req.body.price)) {
    throw ApiError.badRequest('Discount price must be lower than the regular price');
  }

  const slug = await uniqueSlug(Product, req.body.name);
  const product = await Product.create({
    ...req.body,
    slug,
    seller: req.user._id,
    store: req.store._id,
  });

  await Store.updateOne({ _id: req.store._id }, { $inc: { productCount: 1 } });
  const populated = await product.populate(publicPopulate);
  return created(res, populated);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, seller: req.user._id });
  if (!product) throw ApiError.notFound('Product not found in your store');

  if (req.body.category) {
    const category = await Category.findOne({ _id: req.body.category, isActive: true });
    if (!category) throw ApiError.badRequest('Choose a valid category');
  }

  const updates = { ...req.body };
  if (updates.name && updates.name !== product.name) {
    updates.slug = await uniqueSlug(Product, updates.name, product._id);
  }
  Object.assign(product, updates);
  if (product.discountPrice >= product.price) {
    throw ApiError.badRequest('Discount price must be lower than the regular price');
  }
  await product.save();

  const populated = await product.populate(publicPopulate);
  return ok(res, populated);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, seller: req.user._id });
  if (!product) throw ApiError.notFound('Product not found in your store');

  // Archive rather than hard-delete so past orders keep their snapshots.
  product.status = 'archived';
  await product.save();
  await Store.updateOne({ _id: product.store, productCount: { $gt: 0 } }, { $inc: { productCount: -1 } });

  return message(res, 'Product archived and removed from the shop');
});

export const sellerProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 10 });
  const filter = { seller: req.user._id };
  if (req.query.status && ['draft', 'active', 'archived'].includes(req.query.status)) {
    filter.status = req.query.status;
  }
  if (req.query.q) filter.name = new RegExp(escapeRegex(req.query.q), 'i');

  const [items, total] = await Promise.all([
    Product.find(filter).sort('-createdAt').skip(skip).limit(limit).populate('category', 'name slug'),
    Product.countDocuments(filter),
  ]);

  return ok(res, items, paginationMeta(total, { page, limit }));
});

export const reportProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $inc: { reportCount: 1 }, isReported: true },
    { new: true },
  );
  if (!product) throw ApiError.notFound('Product not found');

  const admins = await (await import('../models/User.js')).default.find({ role: 'admin' }).select('_id');
  await Promise.all(
    admins.map((admin) =>
      notify(admin._id, {
        type: 'system',
        title: 'Product reported',
        message: `${product.name} was reported by a customer.`,
        link: '/admin/products',
      }),
    ),
  );

  return message(res, 'Thanks — our team will review this listing');
});

export default { listProducts, getProduct, createProduct };
