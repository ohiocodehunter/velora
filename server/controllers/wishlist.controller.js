import Product from '../models/Product.js';
import Wishlist from '../models/Wishlist.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, message } from '../utils/response.js';

const populate = {
  path: 'products',
  select: 'name slug images price discountPrice finalPrice stock ratingAverage ratingCount status store',
  populate: { path: 'store', select: 'name slug' },
};

const getOrCreate = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) wishlist = await Wishlist.create({ user: userId, products: [] });
  return wishlist;
};

export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreate(req.user._id);
  await wishlist.populate(populate);
  return ok(res, wishlist.products.filter(Boolean));
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId).select('_id name');
  if (!product) throw ApiError.notFound('Product not found');

  const wishlist = await getOrCreate(req.user._id);
  const exists = wishlist.products.some((id) => String(id) === String(product._id));

  if (exists) {
    wishlist.products = wishlist.products.filter((id) => String(id) !== String(product._id));
  } else {
    wishlist.products.push(product._id);
  }
  await wishlist.save();
  await wishlist.populate(populate);

  return ok(
    res,
    { products: wishlist.products.filter(Boolean), added: !exists },
    undefined,
  );
});

export const removeFromWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreate(req.user._id);
  wishlist.products = wishlist.products.filter(
    (id) => String(id) !== String(req.params.productId),
  );
  await wishlist.save();
  return message(res, 'Removed from wishlist');
});

export default { getWishlist, toggleWishlist };
