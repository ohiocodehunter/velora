import crypto from 'node:crypto';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken, setAuthCookie, clearAuthCookie } from '../utils/token.js';
import { ok, created, message } from '../utils/response.js';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../services/email.service.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone = '' } = req.body;
  const exists = await User.exists({ email });
  if (exists) throw ApiError.conflict('An account with this email already exists');

  const user = await User.create({ name, email, password, phone });
  const token = signToken(user);
  setAuthCookie(res, token);

  sendWelcomeEmail(user).catch(() => {});
  return created(res, { user, token });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw ApiError.unauthorized('Email or password is incorrect');

  const matches = await user.comparePassword(password);
  if (!matches) throw ApiError.unauthorized('Email or password is incorrect');
  if (!user.isActive) throw ApiError.forbidden('This account has been suspended. Contact support.');

  user.lastLoginAt = new Date();
  await user.save({ validateBeforeSave: false });

  const token = signToken(user);
  setAuthCookie(res, token);
  return ok(res, { user, token });
});

export const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  return message(res, 'You have been signed out');
});

export const me = asyncHandler(async (req, res) => ok(res, { user: req.user }));

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) throw ApiError.notFound('Account not found');

  if (req.body.name !== undefined) user.name = req.body.name;
  if (req.body.phone !== undefined) user.phone = req.body.phone;
  if (req.body.avatar) user.avatar = req.body.avatar;

  await user.save();
  return ok(res, { user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  const matches = await user.comparePassword(req.body.currentPassword);
  if (!matches) throw ApiError.badRequest('Your current password is incorrect');

  user.password = req.body.newPassword;
  await user.save();
  return message(res, 'Password updated successfully');
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const responseText = 'If an account exists for that email, a reset link has been sent.';

  if (!user) return message(res, responseText);

  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  sendPasswordResetEmail(user, token).catch(() => {});
  return message(res, responseText);
});

export const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: new Date() },
  }).select('+password +resetPasswordToken +resetPasswordExpires');

  if (!user) throw ApiError.badRequest('This reset link is invalid or has expired');

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return message(res, 'Password reset. You can sign in with your new password.');
});

export default { register, login, logout, me, updateProfile, changePassword, forgotPassword, resetPassword };
