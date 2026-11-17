import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Store from '../models/Store.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, message } from '../utils/response.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import { sellerDashboard, sellerAnalytics } from '../services/analytics.service.js';
import { cancelOrder, updateSellerItemStatus } from '../services/order.service.js';
import { ORDER_STATUSES } from '../utils/constants.js';

export const dashboard = asyncHandler(async (req, res) => {
  const store = await Store.findOne({ owner: req.user._id });
  const stats = await sellerDashboard(req.user._id);
  return ok(res, { ...stats, store });
});

export const analytics = asyncHandler(async (req, res) => {
  return ok(res, await sellerAnalytics(req.user._id));
});

export const sellerOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 10 });
  const sellerId = new mongoose.Types.ObjectId(req.user._id);

  const filter = { 'items.seller': sellerId };
  if (req.query.status && ORDER_STATUSES.includes(req.query.status)) {
    filter['items.status'] = req.query.status;
  }
  if (req.query.q) {
    filter.$or = [
      { orderNumber: new RegExp(String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
      { 'shippingAddress.fullName': new RegExp(String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
    ];
  }

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .select('orderNumber status createdAt payment shippingAddress summary items user')
      .populate('user', 'name email'),
    Order.countDocuments(filter),
  ]);

  // Strip other sellers' line items — a seller must never see a competitor's data.
  const scoped = orders.map((order) => {
    const json = order.toObject();
    const items = json.items.filter((item) => String(item.seller) === String(req.user._id));
    return {
      ...json,
      items,
      sellerTotal: items.reduce((sum, item) => sum + item.lineTotal, 0),
      sellerItemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    };
  });

  return ok(res, scoped, paginationMeta(total, { page, limit }));
});

export const sellerOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId).populate('user', 'name email phone');
  if (!order) throw ApiError.notFound('Order not found');

  const items = order.items.filter((item) => String(item.seller) === String(req.user._id));
  if (!items.length) throw ApiError.forbidden('This order has none of your products');

  const json = order.toObject();
  return ok(res, { ...json, items, sellerTotal: items.reduce((sum, item) => sum + item.lineTotal, 0) });
});

export const updateItemStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) throw ApiError.notFound('Order not found');

  const updated = await updateSellerItemStatus(
    order,
    req.user,
    req.params.itemId,
    req.body.status,
    req.body.note,
  );
  const items = updated.items.filter((item) => String(item.seller) === String(req.user._id));
  return ok(res, { ...updated.toObject(), items });
});

export const cancelSellerOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) throw ApiError.notFound('Order not found');
  const updated = await cancelOrder(order, {
    user: req.user,
    role: 'seller',
    reason: req.body.reason,
  });
  return ok(res, updated);
});

export const inventory = asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.user._id, status: { $ne: 'archived' } })
    .sort('stock')
    .select('name slug images stock lowStockThreshold sku status finalPrice soldCount');
  return ok(res, products);
});

export const updateStock = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, seller: req.user._id });
  if (!product) throw ApiError.notFound('Product not found');

  product.stock = req.body.stock;
  if (req.body.lowStockThreshold !== undefined) product.lowStockThreshold = req.body.lowStockThreshold;
  await product.save();
  return message(res, 'Inventory updated', product);
});

export default { dashboard, sellerOrders };
