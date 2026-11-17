import api from './api';
import type { ApiResponse, Product } from '@/types';

export const wishlistService = {
  async getWishlist() {
    const res = await api.get<ApiResponse<Product[]>>('/wishlist');
    return res.data.data;
  },

  async toggleWishlist(productId: string) {
    const res = await api.post<ApiResponse<{ products: Product[]; added: boolean }>>(
      `/wishlist/${productId}`,
    );
    return res.data.data;
  },

  async removeFromWishlist(productId: string) {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/wishlist/${productId}`);
    return res.data;
  },
};
