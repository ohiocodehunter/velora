import api from './api';
import type { ApiResponse, PaginationMeta, Product } from '@/types';

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  q?: string;
  category?: string;
  brand?: string;
  seller?: string;
  store?: string;
  featured?: boolean;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
}

export interface ProductFacets {
  categories: { _id: string; name: string; slug: string; count?: number; image?: any }[];
  brands: (string | { brand: string; count: number })[];
  priceRange: { min: number; max: number };
}

export const productService = {
  async listProducts(params: ProductQueryParams = {}) {
    try {
      const res = await api.get<ApiResponse<Product[]> & { meta: PaginationMeta }>('/products', {
        params,
      });
      const data = res.data;
      const products = Array.isArray(data?.data) ? data.data : [];
      const meta = data?.meta ?? {
        total: products.length,
        page: 1,
        limit: 12,
        pages: 1,
        hasNext: false,
        hasPrev: false,
      };
      return { products, meta };
    } catch {
      return {
        products: [],
        meta: { total: 0, page: 1, limit: 12, pages: 0, hasNext: false, hasPrev: false },
      };
    }
  },

  async getProduct(slug: string) {
    try {
      const res = await api.get<ApiResponse<{ product: Product; reviews?: any[] }>>(`/products/${slug}`);
      return res.data?.data?.product ?? (res.data?.data as any);
    } catch {
      return null;
    }
  },

  async getRelated(slug: string) {
    try {
      const res = await api.get<ApiResponse<Product[]>>(`/products/${slug}/related`);
      return Array.isArray(res.data?.data) ? res.data.data : [];
    } catch {
      return [];
    }
  },

  async getFacets(params: { category?: string } = {}) {
    try {
      const res = await api.get<ApiResponse<ProductFacets>>('/products/facets', { params });
      return res.data?.data ?? { categories: [], brands: [], priceRange: { min: 0, max: 0 } };
    } catch {
      return { categories: [], brands: [], priceRange: { min: 0, max: 0 } };
    }
  },

  async reportProduct(id: string, reason: string) {
    const res = await api.post<ApiResponse<{ message: string }>>(`/products/${id}/report`, {
      reason,
    });
    return res.data;
  },
};
