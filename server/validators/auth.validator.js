import { z } from 'zod';

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password is too long')
  .regex(/[A-Za-z]/, 'Password must include a letter')
  .regex(/\d/, 'Password must include a number');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password,
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')
    .optional()
    .or(z.literal('')),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number')
    .optional()
    .or(z.literal('')),
  avatar: z
    .object({ url: z.string().url(), publicId: z.string().optional().default('') })
    .optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password'),
  newPassword: password,
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  password,
});

export const sellerApplySchema = z.object({
  name: z.string().trim().min(2, 'Enter your store name').max(80),
  tagline: z.string().trim().max(140).optional().default(''),
  description: z.string().trim().max(4000).optional().default(''),
  email: z.string().trim().toLowerCase().email().optional().or(z.literal('')),
  phone: z.string().trim().max(15).optional().default(''),
  address: z
    .object({
      line1: z.string().trim().max(200).optional().default(''),
      city: z.string().trim().max(80).optional().default(''),
      state: z.string().trim().max(80).optional().default(''),
      pincode: z.string().trim().max(10).optional().default(''),
    })
    .optional(),
});

export default { registerSchema, loginSchema };
