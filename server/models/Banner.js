import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 120 },
    subtitle: { type: String, default: '', maxlength: 240 },
    ctaLabel: { type: String, default: 'Shop now' },
    link: { type: String, default: '/shop' },
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    theme: { type: String, enum: ['light', 'dark', 'accent'], default: 'light' },
    position: {
      type: String,
      enum: ['home_hero', 'home_strip', 'category_top'],
      default: 'home_strip',
      index: true,
    },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    startsAt: { type: Date, default: Date.now },
    endsAt: { type: Date },
  },
  { timestamps: true },
);

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
