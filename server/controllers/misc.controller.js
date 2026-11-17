import ContactMessage from '../models/ContactMessage.js';
import Newsletter from '../models/Newsletter.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, created, message } from '../utils/response.js';
import { notify } from '../services/notification.service.js';

export const subscribeNewsletter = asyncHandler(async (req, res) => {
  const email = req.body.email;
  const existing = await Newsletter.findOne({ email });
  if (existing) {
    if (!existing.isActive) {
      existing.isActive = true;
      await existing.save();
    }
    return message(res, 'You are already on the VELORA list');
  }
  await Newsletter.create({ email, source: req.body.source || 'homepage' });
  return created(res, null);
});

export const sendContactMessage = asyncHandler(async (req, res) => {
  const msg = await ContactMessage.create(req.body);
  const admins = await User.find({ role: 'admin' }).select('_id');
  await Promise.all(
    admins.map((admin) =>
      notify(admin._id, {
        type: 'system',
        title: 'New contact message',
        message: `${msg.name}: ${msg.subject}`,
        link: '/admin/messages',
      }),
    ),
  );
  return created(res, msg);
});

export const myNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(30);
  const unread = await Notification.countDocuments({ user: req.user._id, isRead: false });
  return ok(res, { notifications, unread });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true },
  );
  return ok(res, notification);
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  return message(res, 'All notifications marked as read');
});

export default { subscribeNewsletter, sendContactMessage };
