import crypto from 'node:crypto';
import { razorpay, razorpayEnabled, razorpayTestSecret } from '../config/razorpay.js';
import config from '../config/env.js';
import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';
import { toPaise } from '../utils/money.js';
import { markOrderPaid } from './order.service.js';
import { notify } from './notification.service.js';
import logger from '../utils/logger.js';

const sign = (payload, secret) => crypto.createHmac('sha256', secret).update(payload).digest('hex');

const secretFor = () => config.razorpay.keySecret || razorpayTestSecret;

/**
 * Creates a Razorpay order for an existing VELORA order.
 * Amount and currency are always taken from the server-side order summary.
 */
export async function createPaymentOrder(user, orderId) {
  const order = await Order.findOne({ _id: orderId, user: user._id });
  if (!order) throw ApiError.notFound('Order not found');
  if (order.payment.status === 'paid') throw ApiError.badRequest('This order is already paid');
  if (order.status === 'cancelled') throw ApiError.badRequest('This order was cancelled');
  if (order.payment.method !== 'razorpay') {
    throw ApiError.badRequest('This order is set to cash on delivery');
  }

  if (order.payment.razorpayOrderId) {
    return {
      keyId: config.razorpay.keyId || 'rzp_test_velora',
      orderId: order.payment.razorpayOrderId,
      amount: toPaise(order.summary.grandTotal),
      currency: 'INR',
      mock: !razorpayEnabled,
    };
  }

  if (razorpayEnabled) {
    const rzpOrder = await razorpay.orders.create({
      amount: toPaise(order.summary.grandTotal),
      currency: 'INR',
      receipt: order.orderNumber,
      notes: { orderId: String(order._id), orderNumber: order.orderNumber },
    });
    order.payment.razorpayOrderId = rzpOrder.id;
    await order.save();
    return {
      keyId: config.razorpay.keyId,
      orderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      mock: false,
    };
  }

  // Test mode: real HMAC signing/verification, no network call to Razorpay.
  const mockOrderId = `order_test_${crypto.randomBytes(8).toString('hex')}`;
  const mockPaymentId = `pay_test_${crypto.randomBytes(8).toString('hex')}`;
  const signature = sign(`${mockOrderId}|${mockPaymentId}`, secretFor());

  order.payment.razorpayOrderId = mockOrderId;
  order.payment.isMock = true;
  await order.save();

  logger.info(`[razorpay:test] created ${mockOrderId} for ${order.orderNumber}`);

  return {
    keyId: 'rzp_test_velora',
    orderId: mockOrderId,
    amount: toPaise(order.summary.grandTotal),
    currency: 'INR',
    mock: true,
    testPayment: { paymentId: mockPaymentId, signature },
  };
}

/** Verifies the Razorpay signature server-side and marks the order paid. */
export async function verifyPayment(user, { razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    throw ApiError.badRequest('Incomplete payment details');
  }

  const order = await Order.findOne({
    user: user._id,
    'payment.razorpayOrderId': razorpayOrderId,
  });
  if (!order) throw ApiError.notFound('Payment does not match any of your orders');

  // Idempotent: a repeated callback returns the already-paid order.
  if (order.payment.status === 'paid') {
    return { order, alreadyPaid: true };
  }

  const expected = sign(`${razorpayOrderId}|${razorpayPaymentId}`, secretFor());
  const provided = String(razorpaySignature);
  const valid =
    expected.length === provided.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(provided));

  if (!valid) {
    order.payment.status = 'failed';
    await order.save();
    throw ApiError.badRequest('Payment verification failed. No amount was captured.');
  }

  const paid = await markOrderPaid(order, {
    paymentId: razorpayPaymentId,
    signature: provided,
    mock: order.payment.isMock,
  });

  await notify(user._id, {
    type: 'payment',
    title: `Payment received for ${paid.orderNumber}`,
    message: 'Your order is confirmed and being prepared.',
    link: `/orders/${paid._id}`,
  });

  return { order: paid, alreadyPaid: false };
}

export default { createPaymentOrder, verifyPayment };
