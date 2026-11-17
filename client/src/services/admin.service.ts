import api from './api';
import type {
  AdminDashboard,
  ApiResponse,
  Banner,
  Category,
  Coupon,
  Order,
  OrderStatus,
  PaginationMeta,
  Product,
  Review,
  Store,
  User,
} from '@/types';

export const adminService = {
  async getDashboard() {
    const res = await api.get<ApiResponse<AdminDashboard>>('/admin/dashboard');
    return res.data.data;
  },

  // Users
  async getUsers(params: { role?: string; q?: string; page?: number; limit?: number } = {}) {
    const res = await api.get<ApiResponse<User[]> & { meta: PaginationMeta }>('/admin/users', {
      params,
    });
    return {
      users: res.data.data,
      meta: res.data.meta!,
    };
  },

  async updateUser(id: string, data: { isActive?: boolean; role?: string }) {
    const res = await api.patch<ApiResponse<User>>(`/admin/users/${id}`, data);
    return res.data.data;
  },

  // Sellers
  async getSellers(params: { status?: string; page?: number; limit?: number } = {}) {
    const res = await api.get<ApiResponse<Store[]> & { meta: PaginationMeta }>('/admin/sellers', {
      params,
    });
    return {
      sellers: res.data.data,
      meta: res.data.meta!,
    };
  },

  async updateSellerStatus(
    id: string,
    data: { status: 'approved' | 'rejected' | 'suspended' | 'pending'; reason?: string },
  ) {
    const res = await api.patch<ApiResponse<Store>>(`/admin/sellers/${id}/status`, data);
    return res.data.data;
  },

  // Products
  async getProducts(params: { page?: number; limit?: number; q?: string; status?: string; reported?: boolean } = {}) {
    const res = await api.get<ApiResponse<Product[]> & { meta: PaginationMeta }>('/admin/products', {
      params,
    });
    return {
      products: res.data.data,
      meta: res.data.meta!,
    };
  },

  async updateProduct(id: string, data: { isFeatured?: boolean; status?: string }) {
    const res = await api.patch<ApiResponse<Product>>(`/admin/products/${id}`, data);
    return res.data.data;
  },

  async deleteProduct(id: string) {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/admin/products/${id}`);
    return res.data;
  },

  // Orders
  async getOrders(params: { page?: number; limit?: number; status?: string; q?: string } = {}) {
    const res = await api.get<ApiResponse<Order[]> & { meta: PaginationMeta }>('/admin/orders', {
      params,
    });
    return {
      orders: res.data.data,
      meta: res.data.meta!,
    };
  },

  async getOrder(id: string) {
    const res = await api.get<ApiResponse<Order>>(`/admin/orders/${id}`);
    return res.data.data;
  },

  async updateOrderStatus(id: string, data: { status: OrderStatus; note?: string }) {
    const res = await api.patch<ApiResponse<Order>>(`/admin/orders/${id}/status`, data);
    return res.data.data;
  },

  // Categories
  async getCategories() {
    const res = await api.get<ApiResponse<Category[]>>('/admin/categories');
    return res.data.data;
  },

  async createCategory(data: { name: string; description?: string; image?: { url: string }; isFeatured?: boolean }) {
    const res = await api.post<ApiResponse<Category>>('/categories', data);
    return res.data.data;
  },

  async updateCategory(id: string, data: Partial<Category>) {
    const res = await api.patch<ApiResponse<Category>>(`/categories/${id}`, data);
    return res.data.data;
  },

  async deleteCategory(id: string) {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/categories/${id}`);
    return res.data;
  },

  // Coupons
  async getCoupons(params: { page?: number; limit?: number } = {}) {
    const res = await api.get<ApiResponse<Coupon[]> & { meta: PaginationMeta }>('/admin/coupons', {
      params,
    });
    return {
      coupons: res.data.data,
      meta: res.data.meta!,
    };
  },

  async createCoupon(data: Partial<Coupon>) {
    const res = await api.post<ApiResponse<Coupon>>('/admin/coupons', data);
    return res.data.data;
  },

  async updateCoupon(id: string, data: Partial<Coupon>) {
    const res = await api.patch<ApiResponse<Coupon>>(`/admin/coupons/${id}`, data);
    return res.data.data;
  },

  async deleteCoupon(id: string) {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/admin/coupons/${id}`);
    return res.data;
  },

  // Banners
  async getBanners() {
    const res = await api.get<ApiResponse<Banner[]>>('/admin/banners');
    return res.data.data;
  },

  async createBanner(data: Partial<Banner>) {
    const res = await api.post<ApiResponse<Banner>>('/admin/banners', data);
    return res.data.data;
  },

  async updateBanner(id: string, data: Partial<Banner>) {
    const res = await api.patch<ApiResponse<Banner>>(`/admin/banners/${id}`, data);
    return res.data.data;
  },

  async deleteBanner(id: string) {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/admin/banners/${id}`);
    return res.data;
  },

  // Reviews
  async getReviews(params: { reportedOnly?: boolean; page?: number; limit?: number } = {}) {
    const res = await api.get<ApiResponse<Review[]> & { meta: PaginationMeta }>('/admin/reviews', {
      params,
    });
    return {
      reviews: res.data.data,
      meta: res.data.meta!,
    };
  },

  async moderateReview(id: string, status: 'visible' | 'hidden') {
    const res = await api.patch<ApiResponse<Review>>(`/admin/reviews/${id}`, { status });
    return res.data.data;
  },

  async deleteReview(id: string) {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/admin/reviews/${id}`);
    return res.data;
  },

  // Messages
  async getMessages(params: { page?: number; limit?: number } = {}) {
    const res = await api.get<ApiResponse<any[]> & { meta: PaginationMeta }>('/admin/messages', {
      params,
    });
    return {
      messages: res.data.data,
      meta: res.data.meta!,
    };
  },

  async updateMessage(id: string, data: { isResolved?: boolean; replyNotes?: string }) {
    const res = await api.patch<ApiResponse<any>>(`/admin/messages/${id}`, data);
    return res.data.data;
  },

  // Subscribers
  async getSubscribers() {
    const res = await api.get<ApiResponse<any[]>>('/admin/subscribers');
    return res.data.data;
  },
};
