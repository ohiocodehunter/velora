import crypto from 'node:crypto';
import User from '../models/User.js';
import Store from '../models/Store.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { signToken, setAuthCookie, clearAuthCookie } from '../utils/token.js';
import { ok, created, message } from '../utils/response.js';
import { uniqueSlug } from '../utils/slug.js';
import { notify } from '../services/notification.service.js';
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

export const registerSeller = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone = '',
    storeName,
    tagline = '',
    description = '',
    city = '',
    state = '',
    pincode = '',
    shippingPolicy = '',
    returnPolicy = '',
  } = req.body;

  let user = null;

  // If user is already authenticated (session cookie present)
  if (req.user) {
    user = await User.findById(req.user._id);
  } else if (email) {
    // Check if an existing account has this email
    user = await User.findOne({ email }).select('+password');
    if (user && password) {
      const matches = await user.comparePassword(password);
      if (!matches) {
        throw ApiError.conflict('An account with this email already exists. Please enter your correct password or sign in first.');
      }
    }
  }

  // If new user, create their account
  if (!user) {
    if (!name || !email || !password) {
      throw ApiError.badRequest('Name, email, and password are required to register');
    }
    user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'seller',
      sellerStatus: 'approved',
    });
  }

  // Check if store already exists for this user
  let store = await Store.findOne({ owner: user._id });
  if (store) {
    store.status = 'approved';
    if (storeName && storeName !== store.name) {
      store.name = storeName;
      store.slug = await uniqueSlug(Store, storeName, store._id);
    }
    if (tagline) store.tagline = tagline;
    if (description) store.description = description;
    await store.save();
  } else {
    const slug = await uniqueSlug(Store, storeName || `${user.name} Atelier`);
    store = await Store.create({
      name: storeName || `${user.name} Atelier`,
      slug,
      owner: user._id,
      tagline,
      description,
      email: email || user.email,
      phone: phone || user.phone,
      status: 'approved',
      address: {
        city: city || 'Mumbai',
        state: state || 'Maharashtra',
        pincode: pincode || '400001',
        country: 'India',
      },
      policies: {
        shipping: shippingPolicy || 'Dispatches within 24-48 business hours with tracked insured courier.',
        returns: returnPolicy || 'Complimentary 7-day hassle-free doorstep returns.',
      },
    });
  }

  user.role = 'seller';
  user.sellerStatus = 'approved';
  user.store = store._id;
  await user.save({ validateBeforeSave: false });

  const token = signToken(user);
  setAuthCookie(res, token);

  const admins = await User.find({ role: 'admin' }).select('_id');
  await Promise.all(
    admins.map((admin) =>
      notify(admin._id, {
        type: 'seller',
        title: 'New seller registered',
        message: `${user.name} registered store "${store.name}".`,
        link: '/admin/sellers',
      }).catch(() => {}),
    ),
  );

  return created(res, { user, store, token });
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

export default { register, registerSeller, login, logout, me, updateProfile, changePassword, forgotPassword, resetPassword };
