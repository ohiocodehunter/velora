import { Router } from 'express';
import {
  subscribeNewsletter,
  sendContactMessage,
  myNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../controllers/misc.controller.js';
import { publicBanners } from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { contactSchema, newsletterSchema } from '../validators/order.validator.js';

const router = Router();

router.post('/newsletter', validate({ body: newsletterSchema }), subscribeNewsletter);
router.post('/contact', validate({ body: contactSchema }), sendContactMessage);
router.get('/banners', publicBanners);

router.get('/notifications', protect, myNotifications);
router.patch('/notifications/read-all', protect, markAllNotificationsRead);
router.patch('/notifications/:id/read', protect, markNotificationRead);

export default router;
