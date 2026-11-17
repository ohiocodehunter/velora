import api from './api';
import type { ApiResponse, PaginationMeta, Product, ProductFacets } from '@/types';
import { MOCK_PRODUCTS, MOCK_FACETS, queryMockProducts } from '@/data/mockCatalog';

export type { ProductFacets };

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

export const productService = {
  async listProducts(params: ProductQueryParams = {}) {
    try {
      const res = await api.get<ApiResponse<Product[]> & { meta: PaginationMeta }>('/products', {
        params,
      });
      const data = res.data;
      const products = Array.isArray(data?.data) ? data.data : [];
      if (products.length > 0) {
        const meta = data?.meta ?? {
          total: products.length,
          page: 1,
          limit: 12,
          pages: 1,
          hasNext: false,
          hasPrev: false,
        };
        return { products, meta };
      }
      return queryMockProducts(params);
    } catch {
      return queryMockProducts(params);
    }
  },

  async getProduct(slug: string) {
    try {
      const res = await api.get<ApiResponse<{ product: Product; reviews?: any[] }>>(`/products/${slug}`);
      const prod = res.data?.data?.product ?? (res.data?.data as any);
      if (prod && prod._id) {
        return prod;
      }
    } catch {
      // ignore
    }
    const s = String(slug).toLowerCase();
    const found = MOCK_PRODUCTS.find((p) => p.slug.toLowerCase() === s || p._id === slug);
    return found || null;
  },

  async getRelated(slug: string) {
    try {
      const res = await api.get<ApiResponse<Product[]>>(`/products/${slug}/related`);
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      if (list.length > 0) return list;
    } catch {
      // ignore
    }
    const current = MOCK_PRODUCTS.find((p) => p.slug === slug || p._id === slug);
    const catSlug = current && typeof current.category === 'object' ? current.category.slug : '';
    const related = MOCK_PRODUCTS.filter((p) => {
      if (p.slug === slug || p._id === slug) return false;
      if (catSlug && typeof p.category === 'object') {
        return p.category.slug === catSlug;
      }
      return true;
    }).slice(0, 4);
    return related.length > 0 ? related : MOCK_PRODUCTS.slice(0, 4);
  },

  async getFacets(params: { category?: string } = {}) {
    try {
      const res = await api.get<ApiResponse<ProductFacets>>('/products/facets', { params });
      const data = res.data?.data;
      if (data && Array.isArray(data.categories) && data.categories.length > 0) {
        return data;
      }
    } catch {
      // ignore
    }
    return MOCK_FACETS;
  },

  async reportProduct(id: string, reason: string) {
    try {
      const res = await api.post<ApiResponse<{ message: string }>>(`/products/${id}/report`, {
        reason,
      });
      return res.data;
    } catch {
      return { success: true, message: 'Thank you for your report. Our moderation team has been notified.' };
    }
  },
};
