import Address from '../models/Address.js';
import ApiError from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created, message } from '../utils/response.js';

export const listAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id }).sort('-isDefault -createdAt');
  return ok(res, addresses);
});

export const createAddress = asyncHandler(async (req, res) => {
  const count = await Address.countDocuments({ user: req.user._id });
  const makeDefault = req.body.isDefault || count === 0;

  if (makeDefault) {
    await Address.updateMany({ user: req.user._id }, { $set: { isDefault: false } });
  }

  const address = await Address.create({ ...req.body, isDefault: makeDefault, user: req.user._id });
  return created(res, address);
});

export const updateAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!address) throw ApiError.notFound('Address not found');

  if (req.body.isDefault) {
    await Address.updateMany({ user: req.user._id, _id: { $ne: address._id } }, { $set: { isDefault: false } });
  }
  Object.assign(address, req.body);
  await address.save();
  return ok(res, address);
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!address) throw ApiError.notFound('Address not found');

  if (address.isDefault) {
    const next = await Address.findOne({ user: req.user._id }).sort('-createdAt');
    if (next) {
      next.isDefault = true;
      await next.save();
    }
  }
  return message(res, 'Address removed');
});

export const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!address) throw ApiError.notFound('Address not found');

  await Address.updateMany({ user: req.user._id }, { $set: { isDefault: false } });
  address.isDefault = true;
  await address.save();
  return ok(res, address);
});

export default { listAddresses, createAddress };
