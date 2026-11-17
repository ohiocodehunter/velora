import api from './api';
import type { ApiResponse, Category } from '@/types';
import { MOCK_CATEGORIES } from '@/data/mockCatalog';

export const categoryService = {
  async getCategories(params: { featured?: boolean; rootOnly?: boolean } = {}) {
    try {
      const res = await api.get<ApiResponse<Category[]>>('/categories', { params });
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      if (list.length > 0) {
        if (params.featured) {
          return list.filter((c) => c.isFeatured);
        }
        return list;
      }
    } catch {
      // ignore
    }
    if (params.featured) {
      return MOCK_CATEGORIES.filter((c) => c.isFeatured);
    }
    return MOCK_CATEGORIES;
  },

  async getCategory(slug: string) {
    try {
      const res = await api.get<ApiResponse<{ category: Category; children: Category[] }>>(
        `/categories/${slug}`,
      );
      if (res.data?.data?.category) {
        return res.data.data;
      }
    } catch {
      // ignore
    }
    const found = MOCK_CATEGORIES.find((c) => c.slug === slug || c._id === slug);
    return found ? { category: found, children: [] } : null;
  },
};
