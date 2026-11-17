import config from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import { round2 } from '../utils/money.js';

/** Never trust a client price: the effective price always comes from the DB. */
export const effectivePrice = (product) => {
  const price = Number(product.price || 0);
  const discount = Number(product.discountPrice || 0);
  return discount > 0 && discount < price ? discount : price;
};

/** Adds the price delta of chosen variant options ("Size: M / Colour: Sand"). */
export function variantDelta(product, variantLabel = '') {
  if (!variantLabel) return 0;
  let delta = 0;
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
    const option = variant?.options?.find(
      (entry) => entry.label.toLowerCase() === rawLabel.toLowerCase(),
    );
    if (option) delta += Number(option.priceDelta || 0);
  }
  return delta;
}

export function unitPrice(product, variantLabel = '') {
  return round2(effectivePrice(product) + variantDelta(product, variantLabel));
}

const scopeMatches = (coupon, line) => {
  const scope = coupon.appliesTo || {};
  const categories = (scope.categories || []).map(String);
  const products = (scope.products || []).map(String);
  const sellers = (scope.sellers || []).map(String);
  if (!categories.length && !products.length && !sellers.length) return true;
  const product = line.product;
  const productId = String(product._id || product.id || product);
  const categoryId = String(product.category?._id || product.category || '');
  const sellerId = String(product.seller?._id || product.seller || '');
  if (products.includes(productId)) return true;
  if (categories.includes(categoryId)) return true;
  if (sellers.includes(sellerId)) return true;
  return false;
};

export function assertCouponUsable(coupon, userId) {
  if (!coupon || !coupon.isActive) throw ApiError.badRequest('This coupon is no longer available');
  const now = new Date();
  if (coupon.startsAt && now < coupon.startsAt) throw ApiError.badRequest('This coupon is not active yet');
  if (coupon.expiresAt && now > coupon.expiresAt) throw ApiError.badRequest('This coupon has expired');
  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    throw ApiError.badRequest('This coupon has reached its usage limit');
  }
  if (userId) {
    const used = (coupon.usedBy || []).find((entry) => String(entry.user) === String(userId));
    if (used && used.count >= (coupon.perUserLimit || 1)) {
      throw ApiError.badRequest('You have already used this coupon');
    }
  }
}

/**
 * Computes every monetary value for a cart or order on the server.
 * lines: [{ product, quantity, variant, unitPrice, lineTotal }]
 */
export function computeTotals(lines = [], coupon = null, { userId, allowZero = false } = {}) {
  const itemsTotal = round2(lines.reduce((sum, line) => sum + Number(line.lineTotal || 0), 0));

  let discount = 0;
  let couponCode = '';
  let eligibleSubtotal = 0;

  if (coupon && lines.length) {
    assertCouponUsable(coupon, userId);
    const eligible = lines.filter((line) => scopeMatches(coupon, line));
    eligibleSubtotal = round2(eligible.reduce((sum, line) => sum + Number(line.lineTotal || 0), 0));

    if (eligibleSubtotal <= 0) {
      throw ApiError.badRequest('This coupon does not apply to the items in your cart');
    }
    if (coupon.minOrder > 0 && eligibleSubtotal < coupon.minOrder) {
      throw ApiError.badRequest(`Add items worth ₹${coupon.minOrder - eligibleSubtotal} more to use this coupon`);
    }

    if (coupon.type === 'percent') {
      discount = round2((eligibleSubtotal * Number(coupon.value)) / 100);
      if (coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = Math.min(Number(coupon.value), eligibleSubtotal);
    }
    discount = Math.min(round2(discount), itemsTotal);
    couponCode = coupon.code;
  }

  const discountedSubtotal = round2(Math.max(0, itemsTotal - discount));
  const shipping =
    lines.length === 0 || discountedSubtotal >= config.shipping.freeAbove || discountedSubtotal === 0
      ? 0
      : config.shipping.fee;
  const tax = round2(discountedSubtotal * config.shipping.taxRate);
  const grandTotal = round2(discountedSubtotal + shipping + tax);

  if (grandTotal <= 0 && !allowZero && lines.length > 0) {
    throw ApiError.badRequest('Order total could not be calculated');
  }

  return {
    itemsTotal,
    discount,
    shipping,
    tax,
    grandTotal,
    couponCode,
    eligibleSubtotal,
    freeShippingAbove: config.shipping.freeAbove,
    taxRate: config.shipping.taxRate,
  };
}

export default { effectivePrice, variantDelta, unitPrice, computeTotals, assertCouponUsable };
