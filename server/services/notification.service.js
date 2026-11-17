import Notification from '../models/Notification.js';
import logger from '../utils/logger.js';

export async function notify(userId, { type = 'system', title, message = '', link = '' }) {
  try {
    return await Notification.create({ user: userId, type, title, message, link });
  } catch (error) {
    logger.warn('Could not create notification:', error.message);
    return null;
  }
}

export async function notifyMany(userIds, payload) {
  return Promise.all(userIds.map((id) => notify(id, payload)));
}

export default notify;
