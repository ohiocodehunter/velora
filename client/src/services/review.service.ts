import api from './api';
import type { ApiResponse, PaginationMeta, Review } from '@/types';

export interface ReviewPayload {
  productId: string;
  rating: number;
  title?: string;
  body: string;
  orderId?: string;
}

export const reviewService = {
  async getProductReviews(productId: string, params: { page?: number; limit?: number } = {}) {
    try {
      const res = await api.get<any>(`/reviews/product/${productId}`, { params });
      const data = res.data?.data;
      const reviewsList = Array.isArray(data?.reviews)
        ? data.reviews
        : Array.isArray(data)
          ? data
          : [];
      return {
        reviews: reviewsList as Review[],
        meta: res.data?.meta ?? { total: reviewsList.length, page: 1, limit: 10, pages: 1, hasNext: false, hasPrev: false },
      };
    } catch {
      return {
        reviews: [],
        meta: { total: 0, page: 1, limit: 10, pages: 1, hasNext: false, hasPrev: false },
      };
    }
  },

  async getMyReviews() {
    const res = await api.get<ApiResponse<Review[]>>('/reviews/mine');
    return res.data.data;
  },

  async createReview(payload: ReviewPayload) {
    const res = await api.post<ApiResponse<Review>>('/reviews', payload);
    return res.data.data;
  },

  async updateReview(id: string, payload: Partial<ReviewPayload>) {
    const res = await api.patch<ApiResponse<Review>>(`/reviews/${id}`, payload);
    return res.data.data;
  },

  async deleteReview(id: string) {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/reviews/${id}`);
    return res.data;
  },

  async reportReview(id: string, reason: string) {
    const res = await api.post<ApiResponse<{ message: string }>>(`/reviews/${id}/report`, {
      reason,
    });
    return res.data;
  },
};
