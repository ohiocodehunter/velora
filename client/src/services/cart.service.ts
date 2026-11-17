import api from './api';
import type { ApiResponse, Cart, Coupon } from '@/types';

export const cartService = {
  async getCart() {
    const res = await api.get<ApiResponse<Cart>>('/cart');
    return res.data.data;
  },

  async addItem(data: { productId: string; quantity: number; variant?: string }) {
    const res = await api.post<ApiResponse<Cart>>('/cart/items', data);
    return res.data.data;
  },

  async updateItem(itemId: string, quantity: number) {
    const res = await api.patch<ApiResponse<Cart>>(`/cart/items/${itemId}`, { quantity });
    return res.data.data;
  },

  async removeItem(itemId: string) {
    const res = await api.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`);
    return res.data.data;
  },

  async clearCart() {
    const res = await api.delete<ApiResponse<Cart>>('/cart');
    return res.data.data;
  },

  async applyCoupon(code: string) {
    const res = await api.post<ApiResponse<Cart>>('/cart/coupon', { code });
    return res.data.data;
  },

  async removeCoupon() {
    const res = await api.delete<ApiResponse<Cart>>('/cart/coupon');
    return res.data.data;
  },

  async getAvailableCoupons() {
    const res = await api.get<ApiResponse<Coupon[]>>('/cart/coupons');
    return res.data.data;
  },
};
