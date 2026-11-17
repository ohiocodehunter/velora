import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: '' },
    alt: { type: String, default: '' },
  },
  { _id: false },
);

const variantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Size", "Colour"
    options: [
      {
        label: { type: String, required: true },
        priceDelta: { type: Number, default: 0 },
        stock: { type: Number, default: 0, min: 0 },
      },
    ],
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: [true, 'Description is required'], maxlength: 8000 },
    shortDescription: { type: String, default: '', maxlength: 300 },
    images: { type: [imageSchema], default: [] },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: 0, min: 0 },
    // Denormalised selling price so filtering and sorting stay index-friendly.
    finalPrice: { type: Number, default: 0, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    brand: { type: String, default: 'VELORA', trim: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true, index: true },
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    variants: { type: [variantSchema], default: [] },
    specifications: { type: Map, of: String, default: {} },
    tags: { type: [String], default: [] },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'active', index: true },
    soldCount: { type: Number, default: 0 },
    isReported: { type: Boolean, default: false },
    reportCount: { type: Number, default: 0 },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

productSchema.pre('save', function setFinalPrice(next) {
  this.finalPrice =
    this.discountPrice > 0 && this.discountPrice < this.price ? this.discountPrice : this.price;
  next();
});

productSchema.virtual('discountPercent').get(function discountPercent() {
  if (!(this.discountPrice > 0 && this.discountPrice < this.price)) return 0;
  return Math.round(((this.price - this.discountPrice) / this.price) * 100);
});

productSchema.virtual('inStock').get(function inStock() {
  return this.stock > 0;
});

productSchema.index({ name: 'text', description: 'text', tags: 'text', brand: 'text' });
productSchema.index({ category: 1, finalPrice: 1 });
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ store: 1, createdAt: -1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
