import Cart from '../models/Cart.js';
import { computeTotals, unitPrice } from './pricing.service.js';
import { round2 } from '../utils/money.js';

export async function loadCart(userId) {
  let cart = await Cart.findOne({ user: userId })
    .populate({
      path: 'items.product',
      populate: [
        { path: 'store', select: 'name slug status' },
        { path: 'seller', select: 'name' },
        { path: 'category', select: 'name slug' },
      ],
    })
    .populate('coupon');

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
}

/** Shapes a cart for the client, recomputing all money from live product data. */
export function serializeCart(cart) {
  const items = [];
  const lines = [];

  for (const item of cart.items) {
    const product = item.product;
    if (!product) continue; // product deleted — silently drop
    const price = unitPrice(product, item.variant);
    const line = {
      product,
      quantity: item.quantity,
      variant: item.variant,
      unitPrice: price,
      lineTotal: round2(price * item.quantity),
    };

    const storeApproved = !product.store || product.store.status === 'approved';
    const available =
      product.status === 'active' && storeApproved && product.stock >= item.quantity;

    items.push({
      id: String(item._id),
      product: {
        id: String(product._id),
        name: product.name,
        slug: product.slug,
        image: product.images?.[0]?.url || '',
        price: product.price,
        discountPrice: product.discountPrice,
      },
      store: product.store
        ? { id: String(product.store._id), name: product.store.name, slug: product.store.slug }
        : null,
      seller: product.seller ? { id: String(product.seller._id), name: product.seller.name } : null,
      quantity: item.quantity,
      variant: item.variant,
      unitPrice: price,
      lineTotal: line.lineTotal,
      stock: product.stock,
      available,
      stockMessage: !available
        ? product.stock === 0
          ? 'Out of stock'
          : product.stock < item.quantity
            ? `Only ${product.stock} left`
            : 'Unavailable'
        : '',
    });

    if (available) lines.push(line);
  }

  let summary;
  try {
    summary = computeTotals(lines, cart.coupon, { userId: cart.user });
  } catch (error) {
    // A previously saved coupon may no longer be valid — drop it gracefully.
    summary = computeTotals(lines, null, { userId: cart.user });
    cart.coupon = null;
  }

  const coupon = summary.couponCode
    ? {
        code: cart.coupon.code,
        type: cart.coupon.type,
        value: cart.coupon.value,
        description: cart.coupon.description,
      }
    : null;

  return {
    id: String(cart._id),
    items,
    coupon,
    summary,
    itemCount: items.length,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    hasUnavailable: items.some((item) => !item.available),
  };
}

export default { loadCart, serializeCart };
