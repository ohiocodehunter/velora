import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    label: { type: String, default: 'Home', trim: true, maxlength: 30 },
    fullName: { type: String, required: [true, 'Full name is required'], trim: true },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'],
    },
    line1: { type: String, required: [true, 'Address line 1 is required'], trim: true },
    line2: { type: String, default: '', trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: {
      type: String,
      required: true,
      match: [/^\d{6}$/, 'Enter a valid 6-digit pincode'],
    },
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

addressSchema.index({ user: 1, createdAt: -1 });

const Address = mongoose.model('Address', addressSchema);
export default Address;
