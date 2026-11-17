import Category from '../models/Category.js';
import Product from '../models/Product.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created, message } from '../utils/response.js';
import { uniqueSlug } from '../utils/slug.js';

const withCounts = async (categories) => {
  const counts = await Product.aggregate([
    { $match: { status: 'active' } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
  ]);
  const map = new Map(counts.map((row) => [String(row._id), row.count]));
  return categories.map((category) => ({
    ...category,
    productCount: map.get(String(category._id)) || 0,
  }));
};

export const listCategories = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.all !== 'true' || !req.user || req.user.role !== 'admin') filter.isActive = true;
  const categories = await Category.find(filter).sort('sortOrder name').lean();
  return ok(res, await withCounts(categories));
});

export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });
  if (!category) throw ApiError.notFound('Category not found');
  return ok(res, category);
});

export const createCategory = asyncHandler(async (req, res) => {
  const slug = await uniqueSlug(Category, req.body.name);
  const category = await Category.create({ ...req.body, slug });
  return created(res, category);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');

  const updates = { ...req.body };
  if (updates.name && updates.name !== category.name) {
    updates.slug = await uniqueSlug(Category, updates.name, category._id);
  }
  Object.assign(category, updates);
  await category.save();
  return ok(res, category);
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const productCount = await Product.countDocuments({ category: req.params.id, status: 'active' });
  if (productCount > 0) {
    throw ApiError.badRequest(
      `This category still has ${productCount} active product${productCount === 1 ? '' : 's'}. Move them first or deactivate the category.`,
    );
  }
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw ApiError.notFound('Category not found');
  return message(res, 'Category removed');
});

export default { listCategories };
