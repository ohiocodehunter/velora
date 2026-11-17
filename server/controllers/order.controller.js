import Order from '../models/Order.js';
import Address from '../models/Address.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created, message } from '../utils/response.js';
import { getPagination, paginationMeta } from '../utils/pagination.js';
import { createOrder, cancelOrder } from '../services/order.service.js';
import { ORDER_STATUSES } from '../utils/constants.js';

const ORDER_POPULATE = [
  { path: 'items.store', select: 'name slug' },
  { path: 'items.seller', select: 'name email' },
  { path: 'user', select: 'name email phone' },
];

export const placeOrder = asyncHandler(async (req, res) => {
  const { order, reused } = await createOrder(req.user, req.body);
  const populated = await order.populate(ORDER_POPULATE);
  return created(res, { order: populated, reused });
});

export const myOrders = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query, { defaultLimit: 8 });
  const filter = { user: req.user._id };
  if (req.query.status && ORDER_STATUSES.includes(req.query.status)) filter.status = req.query.status;

  const [orders, total] = await Promise.all([
    Order.find(filter).sort('-createdAt').skip(skip).limit(limit).select('-statusHistory'),
    Order.countDocuments(filter),
  ]);

  return ok(res, orders, paginationMeta(total, { page, limit }));
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(ORDER_POPULATE);
  if (!order) throw ApiError.notFound('Order not found');

  const isOwner = String(order.user?._id || order.user) === String(req.user._id);
  const isAdmin = req.user.role === 'admin';
  const isSeller = order.items.some((item) => String(item.seller?._id || item.seller) === String(req.user._id));

  if (!isOwner && !isAdmin && !isSeller) throw ApiError.forbidden();

  return ok(res, order);
});

export const trackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .select('user orderNumber status statusHistory items.name items.status items.statusHistory shippingAddress summary.grandTotal createdAt deliveredAt')
    .populate('items.store', 'name');
  if (!order) throw ApiError.notFound('Order not found');
  if (String(order.user) !== String(req.user._id) && req.user.role !== 'admin') {
    throw ApiError.forbidden();
  }
  return ok(res, order);
});

export const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw ApiError.notFound('Order not found');

  const cancelled = await cancelOrder(order, {
    user: req.user,
    role: 'customer',
    reason: req.body.reason,
  });
  return ok(res, cancelled);
});

export const reorder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw ApiError.notFound('Order not found');
  return ok(
    res,
    order.items.map((item) => ({
      productId: item.product,
      quantity: item.quantity,
      variant: item.variant,
      name: item.name,
    })),
  );
});

export default { placeOrder, myOrders, getOrder };
