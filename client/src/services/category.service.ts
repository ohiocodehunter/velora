import api from './api';
import type { ApiResponse, Category } from '@/types';

export const categoryService = {
  async getCategories(params: { featured?: boolean; rootOnly?: boolean } = {}) {
    try {
      const res = await api.get<ApiResponse<Category[]>>('/categories', { params });
      return Array.isArray(res.data?.data) ? res.data.data : [];
    } catch {
      return [];
    }
  },

  async getCategory(slug: string) {
    const res = await api.get<ApiResponse<{ category: Category; children: Category[] }>>(
      `/categories/${slug}`,
    );
    return res.data?.data;
  },
};
