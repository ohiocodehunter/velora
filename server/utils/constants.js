export const ROLES = { CUSTOMER: 'customer', SELLER: 'seller', ADMIN: 'admin' };

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'refunded',
];

export const ORDER_STATUS_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

export const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export const PAYMENT_METHODS = ['razorpay', 'cod'];
export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];
export const STORE_STATUSES = ['pending', 'approved', 'rejected', 'suspended'];
export const PRODUCT_STATUSES = ['draft', 'active', 'archived'];
export const REVIEW_STATUSES = ['visible', 'hidden', 'reported'];

export const SELLER_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: [],
  refunded: [],
};

export const CUSTOMER_CANCELLABLE = ['pending', 'confirmed', 'processing'];

export default {
  ROLES,
  ORDER_STATUSES,
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABELS,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  STORE_STATUSES,
  PRODUCT_STATUSES,
  REVIEW_STATUSES,
  SELLER_TRANSITIONS,
  CUSTOMER_CANCELLABLE,
};
