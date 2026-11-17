import Razorpay from 'razorpay';
import config from './env.js';

export const razorpayEnabled = Boolean(config.razorpay.keyId && config.razorpay.keySecret);

export const razorpay = razorpayEnabled
  ? new Razorpay({ key_id: config.razorpay.keyId, key_secret: config.razorpay.keySecret })
  : null;

/**
 * In test mode without live keys the API still signs and verifies payments with
 * HMAC-SHA256, using a documented local secret. The checkout UI shows a clearly
 * labelled "test mode" panel and the server verifies the signature for real, so
 * the verification code path is identical to production.
 */
export const razorpayTestSecret = config.razorpay.keySecret || 'velora_razorpay_test_secret';

export default razorpay;
