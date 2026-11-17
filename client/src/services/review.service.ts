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
    const res = await api.get<ApiResponse<Review[]> & { meta: PaginationMeta }>(
      `/reviews/product/${productId}`,
      { params },
    );
    return {
      reviews: res.data.data,
      meta: res.data.meta!,
    };
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
