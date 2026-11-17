import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, message } from '../utils/response.js';
import { loadCart, serializeCart } from '../services/cart.service.js';
import { assertCouponUsable, computeTotals, unitPrice } from '../services/pricing.service.js';
import { round2 } from '../utils/money.js';

const respond = async (userId) => serializeCart(await loadCart(userId));

const variantExists = (product, variantLabel) => {
  if (!variantLabel) return true;
  const parts = String(variantLabel).split('/').map((p) => p.trim()).filter(Boolean);
  return parts.every((part) => {
    const [name, label] = part.split(':').map((v) => v?.trim());
    if (!name || !label) return false;
    const variant = (product.variants || []).find((v) => v.name.toLowerCase() === name.toLowerCase());
    return Boolean(variant?.options?.find((o) => o.label.toLowerCase() === label.toLowerCase()));
  });
};

export const getCart = asyncHandler(async (req, res) => {
  return ok(res, await respond(req.user._id));
});

export const addItem = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, variant = '' } = req.body;
  const product = await Product.findById(productId).populate('store', 'status');
  if (!product || product.status !== 'active') throw ApiError.notFound('Product is not available');
  if (product.store && product.store.status !== 'approved') {
    throw ApiError.badRequest('This store is not accepting orders right now');
  }
  if (!variantExists(product, variant)) throw ApiError.badRequest('Choose a valid variant');
  if (product.stock < 1) throw ApiError.badRequest('This product is out of stock');

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existing = cart.items.find(
    (item) => String(item.product) === String(product._id) && (item.variant || '') === variant,
  );

  if (existing) {
    const nextQty = existing.quantity + quantity;
    if (nextQty > product.stock) {
      throw ApiError.badRequest(`Only ${product.stock} units available`);
    }
    existing.quantity = Math.min(nextQty, 20);
  } else {
    if (quantity > product.stock) throw ApiError.badRequest(`Only ${product.stock} units available`);
    cart.items.push({ product: product._id, quantity, variant });
  }

  await cart.save();
  return ok(res, await respond(req.user._id));
});

export const updateItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw ApiError.notFound('Your cart is empty');

  const item = cart.items.id(req.params.itemId);
  if (!item) throw ApiError.notFound('Item not in your cart');

  const product = await Product.findById(item.product);
  if (!product) throw ApiError.notFound('This product is no longer available');
  if (req.body.quantity > product.stock) {
    throw ApiError.badRequest(`Only ${product.stock} units available`);
  }

  item.quantity = req.body.quantity;
  await cart.save();
  return ok(res, await respond(req.user._id));
});

export const removeItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw ApiError.notFound('Your cart is empty');
  cart.items = cart.items.filter((item) => String(item._id) !== req.params.itemId);
  await cart.save();
  return ok(res, await respond(req.user._id));
});

export const clearCart = asyncHandler(async (req, res) => {
  await Cart.updateOne({ user: req.user._id }, { $set: { items: [], coupon: null } });
  return ok(res, await respond(req.user._id));
});

export const applyCoupon = asyncHandler(async (req, res) => {
  const code = req.body.code.toUpperCase();
  const coupon = await Coupon.findOne({ code });
  if (!coupon) throw ApiError.badRequest('That coupon code is not valid');

  const cart = await loadCart(req.user._id);
  if (!cart.items.length) throw ApiError.badRequest('Add something to your cart first');

  // Rebuild lines exactly as the cart serializer does, then validate against them.
  const lines = cart.items
    .filter((item) => item.product && item.product.status === 'active')
    .map((item) => {
      const price = unitPrice(item.product, item.variant);
      return {
        product: item.product,
        quantity: item.quantity,
        variant: item.variant,
        unitPrice: price,
        lineTotal: round2(price * item.quantity),
      };
    });

  assertCouponUsable(coupon, req.user._id);
  computeTotals(lines, coupon, { userId: req.user._id });

  await Cart.updateOne({ _id: cart._id }, { $set: { coupon: coupon._id } });
  return message(res, `${coupon.code} applied`, await respond(req.user._id));
});

export const removeCoupon = asyncHandler(async (req, res) => {
  await Cart.updateOne({ user: req.user._id }, { $set: { coupon: null } });
  return message(res, 'Coupon removed', await respond(req.user._id));
});

export const listCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({
    isActive: true,
    expiresAt: { $gt: new Date() },
    $or: [{ usageLimit: 0 }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }],
  })
    .sort('-createdAt')
    .select('code description type value minOrder maxDiscount expiresAt');
  return ok(res, coupons);
});

export default { getCart, addItem };
