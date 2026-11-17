import Order from '../models/Order.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/response.js';
import { createPaymentOrder, verifyPayment } from '../services/payment.service.js';
import { sendOrderConfirmation } from '../services/email.service.js';

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const payment = await createPaymentOrder(req.user, req.params.orderId);
  return ok(res, payment);
});

export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { order, alreadyPaid } = await verifyPayment(req.user, req.body);
  const populated = await order.populate([
    { path: 'items.store', select: 'name slug' },
    { path: 'user', select: 'name email' },
  ]);
  if (!alreadyPaid) sendOrderConfirmation(order, req.user).catch(() => {});
  return ok(res, { order: populated, alreadyPaid });
});

export const paymentStatus = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id }).select(
    'orderNumber payment summary',
  );
  return ok(res, order);
});

export default { createRazorpayOrder, verifyRazorpayPayment };
