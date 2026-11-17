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
    const res = await api.get<ApiResponse<Product[]> & { meta: PaginationMeta }>('/products', {
      params,
    });
    return {
      products: Array.isArray(res.data.data) ? res.data.data : [],
      meta: res.data.meta!,
    };
  },

  async getProduct(slug: string) {
    const res = await api.get<ApiResponse<{ product: Product; reviews?: any[] }>>(`/products/${slug}`);
    return res.data.data?.product ?? (res.data.data as any);
  },

  async getRelated(slug: string) {
    const res = await api.get<ApiResponse<Product[]>>(`/products/${slug}/related`);
    return Array.isArray(res.data.data) ? res.data.data : [];
  },

  async getFacets(params: { category?: string } = {}) {
    const res = await api.get<ApiResponse<ProductFacets>>('/products/facets', { params });
    return res.data.data;
  },

  async reportProduct(id: string, reason: string) {
    const res = await api.post<ApiResponse<{ message: string }>>(`/products/${id}/report`, {
      reason,
    });
    return res.data;
  },
};
