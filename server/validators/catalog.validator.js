import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid id');

export const productSchema = z.object({
  name: z.string().trim().min(3, 'Product name is too short').max(160),
  description: z.string().trim().min(20, 'Add at least 20 characters of description').max(8000),
  shortDescription: z.string().trim().max(300).optional().default(''),
  price: z.coerce.number().min(1, 'Price must be greater than 0'),
  discountPrice: z.coerce.number().min(0).optional().default(0),
  category: objectId,
  brand: z.string().trim().max(60).optional().default('VELORA'),
  stock: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0).optional().default(5),
  sku: z.string().trim().min(2, 'SKU is required').max(40),
  images: z
    .array(z.object({ url: z.string().min(1), publicId: z.string().optional().default(''), alt: z.string().optional().default('') }))
    .min(1, 'Add at least one product image')
    .max(6, 'A product can have up to 6 images'),
  variants: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        options: z
          .array(
            z.object({
              label: z.string().trim().min(1),
              priceDelta: z.coerce.number().optional().default(0),
              stock: z.coerce.number().int().min(0).optional().default(0),
            }),
          )
          .min(1),
      }),
    )
    .optional()
    .default([]),
  specifications: z.record(z.string()).optional().default({}),
  tags: z.array(z.string().trim()).optional().default([]),
  isFeatured: z.boolean().optional().default(false),
  status: z.enum(['draft', 'active', 'archived']).optional().default('active'),
});

export const productUpdateSchema = productSchema.partial();

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  description: z.string().trim().max(600).optional().default(''),
  image: z.object({ url: z.string().default(''), publicId: z.string().optional().default('') }).optional(),
  parent: objectId.nullable().optional(),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(true),
  sortOrder: z.coerce.number().int().optional().default(0),
});

export const categoryUpdateSchema = categorySchema.partial();

export const storeUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  tagline: z.string().trim().max(140).optional(),
  description: z.string().trim().max(4000).optional(),
  logo: z.object({ url: z.string().default(''), publicId: z.string().optional().default('') }).optional(),
  banner: z.object({ url: z.string().default(''), publicId: z.string().optional().default('') }).optional(),
  phone: z.string().trim().max(15).optional(),
  email: z.string().trim().email().optional().or(z.literal('')),
  address: z
    .object({
      line1: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      pincode: z.string().optional(),
    })
    .optional(),
  policies: z.object({ shipping: z.string().optional(), returns: z.string().optional() }).optional(),
});

export default { productSchema };
