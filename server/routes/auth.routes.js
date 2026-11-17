import { Router } from 'express';
import {
  register,
  login,
  logout,
  me,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator.js';

const router = Router();

router.post('/register', authLimiter, validate({ body: registerSchema }), register);
router.post('/login', authLimiter, validate({ body: loginSchema }), login);
router.post('/logout', logout);
router.get('/me', protect, me);
router.patch('/profile', protect, validate({ body: updateProfileSchema }), updateProfile);
router.patch('/password', protect, validate({ body: changePasswordSchema }), changePassword);
router.post('/forgot-password', authLimiter, validate({ body: forgotPasswordSchema }), forgotPassword);
router.post('/reset-password/:token', authLimiter, validate({ body: resetPasswordSchema }), resetPassword);

export default router;
