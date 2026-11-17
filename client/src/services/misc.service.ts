import api from './api';
import type { ApiResponse, Banner, NotificationItem } from '@/types';

export const miscService = {
  async getBanners(position?: string) {
    const res = await api.get<ApiResponse<Banner[]>>('/banners', {
      params: position ? { position } : undefined,
    });
    return res.data.data;
  },

  async subscribeNewsletter(email: string) {
    const res = await api.post<ApiResponse<{ message: string }>>('/newsletter', { email });
    return res.data;
  },

  async sendContactMessage(data: { name: string; email: string; subject: string; message: string }) {
    const res = await api.post<ApiResponse<{ message: string }>>('/contact', data);
    return res.data;
  },

  async getNotifications() {
    const res = await api.get<ApiResponse<NotificationItem[]>>('/notifications');
    return res.data.data;
  },

  async markAllNotificationsRead() {
    const res = await api.patch<ApiResponse<{ message: string }>>('/notifications/read-all');
    return res.data;
  },

  async markNotificationRead(id: string) {
    const res = await api.patch<ApiResponse<{ message: string }>>(`/notifications/${id}/read`);
    return res.data;
  },
};
