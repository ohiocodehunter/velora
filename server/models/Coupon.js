import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    description: { type: String, default: '' },
    type: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
    value: { type: Number, required: true, min: 0 },
    minOrder: { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 }, // 0 = no cap (percent coupons)
    usageLimit: { type: Number, default: 0 }, // 0 = unlimited
    perUserLimit: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    usedBy: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, count: Number }],
    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    appliesTo: {
      categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
      products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      sellers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
  },
  { timestamps: true },
);

couponSchema.index({ isActive: 1, expiresAt: 1 });

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
