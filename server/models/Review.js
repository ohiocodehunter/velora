import mongoose from 'mongoose';
import { REVIEW_STATUSES } from '../utils/constants.js';

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, default: '', maxlength: 120 },
    body: { type: String, required: [true, 'Review text is required'], maxlength: 2000 },
    isVerifiedPurchase: { type: Boolean, default: false },
    status: { type: String, enum: REVIEW_STATUSES, default: 'visible', index: true },
    reportCount: { type: Number, default: 0 },
    reportReason: { type: String, default: '' },
  },
  { timestamps: true },
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);
export default Review;
