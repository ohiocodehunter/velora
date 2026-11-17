import mongoose from 'mongoose';

const storeSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: [true, 'Store name is required'], trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    tagline: { type: String, default: '', maxlength: 140 },
    description: { type: String, default: '', maxlength: 4000 },
    logo: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    banner: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    email: { type: String, lowercase: true, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    address: {
      line1: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    policies: {
      shipping: { type: String, default: '' },
      returns: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
      index: true,
    },
    rejectionReason: { type: String, default: '' },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    productCount: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
  },
  { timestamps: true },
);

storeSchema.index({ status: 1, createdAt: -1 });

const Store = mongoose.model('Store', storeSchema);
export default Store;
