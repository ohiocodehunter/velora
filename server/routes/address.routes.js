import { Router } from 'express';
import {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '../controllers/address.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { addressSchema } from '../validators/order.validator.js';

const router = Router();
router.use(protect);

router.get('/', listAddresses);
router.post('/', validate({ body: addressSchema }), createAddress);
router.patch('/:id', validate({ body: addressSchema.partial() }), updateAddress);
router.delete('/:id', deleteAddress);
router.patch('/:id/default', setDefaultAddress);

export default router;
