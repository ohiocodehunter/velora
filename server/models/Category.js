import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Category name is required'], trim: true, maxlength: 60 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, default: '', maxlength: 600 },
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    isActive: { type: Boolean, default: true, index: true },
    isFeatured: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

categorySchema.index({ sortOrder: 1, name: 1 });

const Category = mongoose.model('Category', categorySchema);
export default Category;
