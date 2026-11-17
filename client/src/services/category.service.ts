import api from './api';
import type { ApiResponse, Category } from '@/types';

export const categoryService = {
  async getCategories(params: { featured?: boolean; rootOnly?: boolean } = {}) {
    const res = await api.get<ApiResponse<Category[]>>('/categories', { params });
    return res.data.data;
  },

  async getCategory(slug: string) {
    const res = await api.get<ApiResponse<{ category: Category; children: Category[] }>>(
      `/categories/${slug}`,
    );
    return res.data.data;
  },
};
