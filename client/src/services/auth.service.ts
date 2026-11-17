import api from './api';
import type { ApiResponse, User } from '@/types';

export interface AuthResponseData {
  user: User;
  token?: string;
}

export const authService = {
  async register(data: { name: string; email: string; password: string; phone?: string }) {
    const res = await api.post<ApiResponse<AuthResponseData>>('/auth/register', data);
    return res.data.data;
  },

  async login(credentials: { email: string; password: string }) {
    const res = await api.post<ApiResponse<AuthResponseData>>('/auth/login', credentials);
    return res.data.data;
  },

  async logout() {
    const res = await api.post<ApiResponse<{ message: string }>>('/auth/logout');
    return res.data;
  },

  async me() {
    const res = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return res.data.data.user;
  },

  async updateProfile(data: { name?: string; phone?: string; avatar?: { url: string; publicId?: string } }) {
    const res = await api.patch<ApiResponse<{ user: User }>>('/auth/profile', data);
    return res.data.data.user;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const res = await api.patch<ApiResponse<{ message: string }>>('/auth/password', data);
    return res.data;
  },
};
