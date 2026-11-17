import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const cartItemSchema = z.object({
  productId: objectId,
  quantity: z.coerce.number().int().min(1).max(20).default(1),
  variant: z.string().trim().max(160).optional().default(''),
});

export const cartQuantitySchema = z.object({
  quantity: z.coerce.number().int().min(1).max(20),
});

export const couponCodeSchema = z.object({
  code: z.string().trim().min(2, 'Enter a coupon code').max(30),
});

export const addressSchema = z.object({
  label: z.string().trim().max(30).optional().default('Home'),
  fullName: z.string().trim().min(2, 'Enter the recipient name').max(80),
  phone: z.string().trim().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  line1: z.string().trim().min(5, 'Enter the street address').max(200),
  line2: z.string().trim().max(200).optional().default(''),
  city: z.string().trim().min(2, 'Enter the city').max(80),
  state: z.string().trim().min(2, 'Enter the state').max(80),
  pincode: z.string().trim().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  country: z.string().trim().max(60).optional().default('India'),
  isDefault: z.boolean().optional().default(false),
});

export const createOrderSchema = z.object({
  addressId: objectId,
  paymentMethod: z.enum(['razorpay', 'cod']),
  notes: z.string().trim().max(500).optional().default(''),
  idempotencyKey: z.string().trim().min(8).max(80).optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().trim().max(300).optional().default(''),
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().trim().min(3),
  razorpayPaymentId: z.string().trim().min(3),
  razorpaySignature: z.string().trim().min(10),
});

export const reviewSchema = z.object({
  productId: objectId,
  rating: z.coerce.number().int().min(1, 'Choose a rating').max(5),
  title: z.string().trim().max(120).optional().default(''),
  body: z.string().trim().min(10, 'Write at least 10 characters').max(2000),
  orderId: objectId.optional(),
});

export const sellerStatusSchema = z.object({
  status: z.enum(['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled']),
  note: z.string().trim().max(300).optional().default(''),
});

export const couponSchema = z.object({
  code: z.string().trim().min(2).max(30),
  description: z.string().trim().max(200).optional().default(''),
  type: z.enum(['percent', 'fixed']),
  value: z.coerce.number().min(1),
  minOrder: z.coerce.number().min(0).optional().default(0),
  maxDiscount: z.coerce.number().min(0).optional().default(0),
  usageLimit: z.coerce.number().int().min(0).optional().default(0),
  perUserLimit: z.coerce.number().int().min(1).optional().default(1),
  startsAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date(),
  isActive: z.boolean().optional().default(true),
  appliesTo: z
    .object({
      categories: z.array(objectId).optional().default([]),
      products: z.array(objectId).optional().default([]),
      sellers: z.array(objectId).optional().default([]),
    })
    .optional(),
});

export const bannerSchema = z.object({
  title: z.string().trim().min(2).max(120),
  subtitle: z.string().trim().max(240).optional().default(''),
  ctaLabel: z.string().trim().max(40).optional().default('Shop now'),
  link: z.string().trim().max(300).optional().default('/shop'),
  image: z.object({ url: z.string().default(''), publicId: z.string().optional().default('') }).optional(),
  theme: z.enum(['light', 'dark', 'accent']).optional().default('light'),
  position: z.enum(['home_hero', 'home_strip', 'category_top']).optional().default('home_strip'),
  sortOrder: z.coerce.number().int().optional().default(0),
  isActive: z.boolean().optional().default(true),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  subject: z.string().trim().min(3).max(140),
  message: z.string().trim().min(10, 'Tell us a little more').max(4000),
});

export const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
});

export default { createOrderSchema };
