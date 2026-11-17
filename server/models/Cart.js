import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, max: 20, default: 1 },
    variant: { type: String, default: '' }, // human readable, e.g. "Size: M / Colour: Sand"
  },
  { _id: true, timestamps: true },
);

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: { type: [cartItemSchema], default: [] },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null },
  },
  { timestamps: true },
);

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;
