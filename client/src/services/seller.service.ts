import api from './api';
import type {
  ApiResponse,
  Order,
  OrderStatus,
  PaginationMeta,
  Product,
  Review,
  SellerDashboard,
  Store,
} from '@/types';

export interface ProductInputPayload {
  name: string;
  description: string;
  shortDescription?: string;
  category: string;
  brand: string;
  price: number;
  discountPrice?: number;
  stock: number;
  lowStockThreshold?: number;
  sku?: string;
  images: { url: string; publicId?: string; alt?: string }[];
  variants?: { name: string; options: { label: string; priceDelta: number; stock: number }[] }[];
  specifications?: Record<string, string>;
  tags?: string[];
  status?: 'draft' | 'active' | 'archived';
  isFeatured?: boolean;
}

export interface SellerApplyPayload {
  name: string;
  tagline?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: {
    line1?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  policies?: {
    shipping?: string;
    returns?: string;
  };
}

export const sellerService = {
  async getDashboard() {
    const res = await api.get<ApiResponse<SellerDashboard>>('/seller/dashboard');
    return res.data.data;
  },

  async getAnalytics() {
    const res = await api.get<ApiResponse<unknown>>('/seller/analytics');
    return res.data.data;
  },

  async getOrders(params: { page?: number; limit?: number; status?: string; q?: string } = {}) {
    const res = await api.get<ApiResponse<Order[]> & { meta: PaginationMeta }>('/seller/orders', {
      params,
    });
    return {
      orders: res.data.data,
      meta: res.data.meta!,
    };
  },

  async getOrder(orderId: string) {
    const res = await api.get<ApiResponse<Order>>(`/seller/orders/${orderId}`);
    return res.data.data;
  },

  async updateItemStatus(
    orderId: string,
    itemId: string,
    status: OrderStatus,
    note?: string,
  ) {
    const res = await api.patch<ApiResponse<Order>>(
      `/seller/orders/${orderId}/items/${itemId}`,
      { status, note },
    );
    return res.data.data;
  },

  async cancelOrder(orderId: string, reason?: string) {
    const res = await api.post<ApiResponse<Order>>(`/seller/orders/${orderId}/cancel`, {
      reason,
    });
    return res.data.data;
  },

  async getInventory(params: { lowStockOnly?: boolean; page?: number; limit?: number } = {}) {
    const res = await api.get<ApiResponse<Product[]> & { meta: PaginationMeta }>('/seller/inventory', {
      params,
    });
    return {
      inventory: res.data.data,
      meta: res.data.meta!,
    };
  },

  async updateStock(productId: string, stock: number, lowStockThreshold?: number) {
    const res = await api.patch<ApiResponse<Product>>(`/seller/inventory/${productId}`, {
      stock,
      lowStockThreshold,
    });
    return res.data.data;
  },

  async getReviews(params: { page?: number; limit?: number } = {}) {
    const res = await api.get<ApiResponse<Review[]> & { meta: PaginationMeta }>('/seller/reviews', {
      params,
    });
    return {
      reviews: res.data.data,
      meta: res.data.meta!,
    };
  },

  // Products
  async getMyProducts(params: { page?: number; limit?: number; q?: string; status?: string } = {}) {
    const res = await api.get<ApiResponse<Product[]> & { meta: PaginationMeta }>('/products/seller/mine', {
      params,
    });
    return {
      products: res.data.data,
      meta: res.data.meta!,
    };
  },

  async createProduct(data: ProductInputPayload) {
    const res = await api.post<ApiResponse<Product>>('/products', data);
    return res.data.data;
  },

  async updateProduct(id: string, data: Partial<ProductInputPayload>) {
    const res = await api.patch<ApiResponse<Product>>(`/products/${id}`, data);
    return res.data.data;
  },

  async deleteProduct(id: string) {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/products/${id}`);
    return res.data;
  },

  // Store
  async getMyStore() {
    const res = await api.get<ApiResponse<Store>>('/stores/mine');
    return res.data.data;
  },

  async applyForStore(data: SellerApplyPayload) {
    const res = await api.post<ApiResponse<Store>>('/stores/apply', data);
    return res.data.data;
  },

  async updateMyStore(data: Partial<SellerApplyPayload> & { logo?: { url: string; publicId?: string }; banner?: { url: string; publicId?: string } }) {
    const res = await api.patch<ApiResponse<Store>>('/stores/mine', data);
    return res.data.data;
  },
};
