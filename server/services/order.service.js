import Address from '../models/Address.js';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Store from '../models/Store.js';
import ApiError from '../utils/ApiError.js';
import { CUSTOMER_CANCELLABLE, ORDER_STATUS_LABELS, SELLER_TRANSITIONS } from '../utils/constants.js';
import { computeOrderStatus, buildOrderNumber } from '../utils/orderStatus.js';
import { round2 } from '../utils/money.js';
import { computeTotals, unitPrice } from './pricing.service.js';
import { loadCart } from './cart.service.js';
import { notify } from './notification.service.js';
import { sendOrderConfirmation, sendOrderStatusEmail } from './email.service.js';

const variantAvailable = (product, variantLabel, quantity) => {
  if (!variantLabel) return true;
  const parts = String(variantLabel)
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);
  for (const part of parts) {
    const [rawName, rawLabel] = part.split(':').map((value) => value?.trim());
    if (!rawName || !rawLabel) continue;
    const variant = (product.variants || []).find(
      (entry) => entry.name.toLowerCase() === rawName.toLowerCase(),
    );
    if (!variant) return false;
    const option = variant.options.find(
      (entry) => entry.label.toLowerCase() === rawLabel.toLowerCase(),
    );
    if (!option) return false;
    if (option.stock !== undefined && option.stock >= 0 && option.stock < quantity) return false;
  }
  return true;
};

export async function createOrder(user, { addressId, paymentMethod = 'cod', notes = '', idempotencyKey }) {
  if (idempotencyKey) {
    const existing = await Order.findOne({ user: user._id, idempotencyKey });
    if (existing) return { order: existing, reused: true };
  }

  const address = await Address.findOne({ _id: addressId, user: user._id });
  if (!address) throw ApiError.badRequest('Select a delivery address');

  const cart = await loadCart(user._id);
  if (!cart.items.length) throw ApiError.badRequest('Your cart is empty');

  const lines = [];
  const orderItems = [];
  const problems = [];

  for (const item of cart.items) {
    const product = item.product;
    if (!product) continue;
    const store = product.store;
    const unavailable =
      product.status !== 'active' ||
      !store ||
      store.status !== 'approved' ||
      product.stock < item.quantity ||
      !variantAvailable(product, item.variant, item.quantity);
    if (unavailable) {
      problems.push(product.name);
      continue;
    }
    const price = unitPrice(product, item.variant);
    const lineTotal = round2(price * item.quantity);
    lines.push({ product, quantity: item.quantity, variant: item.variant, unitPrice: price, lineTotal });
    orderItems.push({
      product: product._id,
      seller: product.seller?._id || product.seller,
      store: store._id,
      name: product.name,
      image: product.images?.[0]?.url || '',
      slug: product.slug,
      sku: product.sku,
      variant: item.variant,
      price,
      quantity: item.quantity,
      lineTotal,
      status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
      statusHistory: [
        {
          status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
          note: paymentMethod === 'cod' ? 'Order placed — cash on delivery' : 'Awaiting payment',
          at: new Date(),
          by: user._id,
        },
      ],
    });
  }

  if (problems.length) {
    throw ApiError.conflict(`Some items are no longer available: ${problems.join(', ')}`);
  }
  if (!orderItems.length) throw ApiError.badRequest('Your cart is empty');

  const summary = computeTotals(lines, cart.coupon, { userId: user._id });
  const initialStatus = paymentMethod === 'cod' ? 'confirmed' : 'pending';

  const order = await Order.create({
    orderNumber: buildOrderNumber(),
    user: user._id,
    items: orderItems,
    shippingAddress: {
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country,
    },
    summary,
    payment: { method: paymentMethod, status: 'pending' },
    status: initialStatus,
    statusHistory: [
      {
        status: initialStatus,
        note: paymentMethod === 'cod' ? 'Order placed — cash on delivery' : 'Order created, awaiting payment',
        at: new Date(),
        by: user._id,
      },
    ],
    notes,
    idempotencyKey: idempotencyKey || undefined,
  });

  // Atomic, conditional stock decrement — prevents overselling without relying on
  // multi-document transactions (works on any MongoDB deployment).
  const decremented = [];
  try {
    for (const item of order.items) {
      // eslint-disable-next-line no-await-in-loop
      const updated = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity }, status: 'active' },
        { $inc: { stock: -item.quantity, soldCount: item.quantity } },
        { new: true },
      );
      if (!updated) {
        throw ApiError.conflict(`${item.name} went out of stock. Please update your cart.`);
      }
      decremented.push(item);
    }
  } catch (error) {
    await Promise.all(
      decremented.map((item) =>
        Product.updateOne(
          { _id: item.product },
          { $inc: { stock: item.quantity, soldCount: -item.quantity } },
        ),
      ),
    );
    await Order.deleteOne({ _id: order._id });
    throw error;
  }

  await Cart.updateOne({ _id: cart._id }, { $set: { items: [], coupon: null } });

  if (cart.coupon) {
    const existingUse = await Coupon.updateOne(
      { _id: cart.coupon._id, 'usedBy.user': user._id },
      { $inc: { usedCount: 1, 'usedBy.$.count': 1 } },
    );
    if (!existingUse.matchedCount) {
      await Coupon.updateOne(
        { _id: cart.coupon._id },
        { $inc: { usedCount: 1 }, $push: { usedBy: { user: user._id, count: 1 } } },
      );
    }
  }

  await notify(user._id, {
    type: 'order',
    title: `Order ${order.orderNumber} placed`,
    message: paymentMethod === 'cod' ? 'Pay on delivery. We will keep you posted.' : 'Complete payment to confirm your order.',
    link: `/orders/${order._id}`,
  });

  const sellerIds = [...new Set(orderItems.map((item) => String(item.seller)))];
  await Promise.all(
    sellerIds.map((sellerId) =>
      notify(sellerId, {
        type: 'seller',
        title: 'New order received',
        message: `${order.orderNumber} includes ${orderItems.filter((item) => String(item.seller) === sellerId).length} of your products.`,
        link: `/seller/orders`,
      }),
    ),
  );

  sendOrderConfirmation(order, user).catch(() => {});

  return { order, reused: false };
}

export async function restoreStock(items) {
  await Promise.all(
    items.map((item) =>
      Product.updateOne(
        { _id: item.product },
        { $inc: { stock: item.quantity, soldCount: -item.quantity } },
      ),
    ),
  );
}

async function refreshOrderStatus(order, actorId, note) {
  const next = computeOrderStatus(order.items);
  if (next !== order.status) {
    order.status = next;
    order.statusHistory.push({ status: next, note, at: new Date(), by: actorId });
  }
  if (next === 'delivered' && !order.deliveredAt) order.deliveredAt = new Date();
  if (next === 'cancelled' && order.payment.status === 'paid') {
    order.payment.status = 'refunded';
    order.payment.refundedAt = new Date();
  }
  await order.save();
  return next;
}

export async function cancelOrder(order, { user, role, reason = '' }) {
  if (order.status === 'cancelled' || order.status === 'refunded') {
    throw ApiError.badRequest('This order is already cancelled');
  }

  if (role === 'customer') {
    if (String(order.user) !== String(user._id)) throw ApiError.forbidden();
    if (!CUSTOMER_CANCELLABLE.includes(order.status)) {
      throw ApiError.badRequest('This order can no longer be cancelled. Please contact support.');
    }
    order.items.forEach((item) => {
      if (item.status !== 'cancelled') {
        item.status = 'cancelled';
        item.statusHistory.push({ status: 'cancelled', note: reason || 'Cancelled by customer', at: new Date(), by: user._id });
      }
    });
    await restoreStock(order.items);
    order.cancelReason = reason;
    order.cancelledBy = 'customer';
    // Customer cancellation is final regardless of seller progress.
    order.status = 'cancelled';
    order.statusHistory.push({ status: 'cancelled', note: reason || 'Cancelled by customer', at: new Date(), by: user._id });
    if (order.payment.status === 'paid') {
      order.payment.status = 'refunded';
      order.payment.refundedAt = new Date();
    }
    await order.save();
    await notify(user._id, {
      type: 'order',
      title: `Order ${order.orderNumber} cancelled`,
      message: order.payment.status === 'refunded' ? 'Your refund will reflect in 3–5 business days.' : 'Your order has been cancelled.',
      link: `/orders/${order._id}`,
    });
    sendOrderStatusEmail(order, user, 'Cancelled').catch(() => {});
    return order;
  }

  if (role === 'seller') {
    const sellerId = String(user._id);
    const sellerItems = order.items.filter((item) => String(item.seller) === sellerId);
    if (!sellerItems.length) throw ApiError.forbidden('This order has none of your products');
    const cancellable = sellerItems.filter((item) => CUSTOMER_CANCELLABLE.includes(item.status));
    if (!cancellable.length) throw ApiError.badRequest('These items can no longer be cancelled');
    cancellable.forEach((item) => {
      item.status = 'cancelled';
      item.statusHistory.push({ status: 'cancelled', note: reason || 'Cancelled by seller', at: new Date(), by: user._id });
    });
    await restoreStock(cancellable);
    order.cancelledBy = 'seller';
    await refreshOrderStatus(order, user._id, reason || 'Seller cancelled items');
    return order;
  }

  // admin
  order.items.forEach((item) => {
    if (item.status !== 'cancelled') {
      item.status = 'cancelled';
      item.statusHistory.push({ status: 'cancelled', note: reason || 'Cancelled by VELORA', at: new Date(), by: user._id });
    }
  });
  await restoreStock(order.items);
  order.cancelReason = reason;
  order.cancelledBy = 'admin';
  order.status = 'cancelled';
  order.statusHistory.push({ status: 'cancelled', note: reason || 'Cancelled by VELORA', at: new Date(), by: user._id });
  if (order.payment.status === 'paid') {
    order.payment.status = 'refunded';
    order.payment.refundedAt = new Date();
  }
  await order.save();
  return order;
}

export async function updateSellerItemStatus(order, seller, itemId, status, note = '') {
  const item = order.items.id(itemId) || order.items.find((entry) => String(entry._id) === String(itemId));
  if (!item) throw ApiError.notFound('Order item not found');
  if (String(item.seller) !== String(seller._id)) throw ApiError.forbidden('This item belongs to another seller');

  const allowed = SELLER_TRANSITIONS[item.status] || [];
  if (!allowed.includes(status)) {
    throw ApiError.badRequest(
      `Cannot move an item from ${ORDER_STATUS_LABELS[item.status]} to ${ORDER_STATUS_LABELS[status] || status}`,
    );
  }

  if (status === 'cancelled') {
    await restoreStock([item]);
    item.status = 'cancelled';
    item.statusHistory.push({ status, note: note || 'Cancelled by seller', at: new Date(), by: seller._id });
    order.cancelledBy = 'seller';
    await refreshOrderStatus(order, seller._id, note);
    return order;
  }

  item.status = status;
  item.statusHistory.push({
    status,
    note: note || `Marked ${ORDER_STATUS_LABELS[status]} by seller`,
    at: new Date(),
    by: seller._id,
  });

  if (status === 'delivered') {
    await Store.updateOne({ owner: seller._id }, { $inc: { totalSales: item.lineTotal } });
  }

  const next = await refreshOrderStatus(order, seller._id, `Item marked ${ORDER_STATUS_LABELS[status]}`);

  await notify(order.user, {
    type: 'order',
    title: `Order ${order.orderNumber} updated`,
    message: `${item.name} is now ${ORDER_STATUS_LABELS[status]}.`,
    link: `/orders/${order._id}`,
  });

  try {
    const buyer = await order.populate('user', 'name email');
    sendOrderStatusEmail(order, buyer.user, ORDER_STATUS_LABELS[next] || ORDER_STATUS_LABELS[status]).catch(() => {});
  } catch {
    /* email is best-effort */
  }

  return order;
}

export async function markOrderPaid(order, { paymentId, signature, mock = false }) {
  if (order.payment.status === 'paid') return order; // idempotent
  order.payment.status = 'paid';
  order.payment.razorpayPaymentId = paymentId;
  order.payment.razorpaySignature = signature;
  order.payment.paidAt = new Date();
  order.payment.isMock = mock;
  order.status = 'confirmed';
  order.statusHistory.push({ status: 'confirmed', note: 'Payment received', at: new Date() });
  order.items.forEach((item) => {
    if (item.status === 'pending') {
      item.status = 'confirmed';
      item.statusHistory.push({ status: 'confirmed', note: 'Payment received', at: new Date() });
    }
  });
  await order.save();
  return order;
}

export default { createOrder, cancelOrder, updateSellerItemStatus, markOrderPaid, restoreStock };
