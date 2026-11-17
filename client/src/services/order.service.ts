import api from './api';
import type { ApiResponse, Order, PaginationMeta } from '@/types';

export interface CreateOrderPayload {
  addressId: string;
  paymentMethod: 'razorpay' | 'cod';
  notes?: string;
  idempotencyKey?: string;
}

export interface PaymentOrderResult {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  mock: boolean;
  testPayment?: {
    paymentId: string;
    signature: string;
  };
}

export const orderService = {
  async placeOrder(payload: CreateOrderPayload) {
    const res = await api.post<ApiResponse<{ order: Order; reused: boolean }>>('/orders', payload);
    return res.data.data;
  },

  async getMyOrders(params: { page?: number; limit?: number; status?: string } = {}) {
    const res = await api.get<ApiResponse<Order[]> & { meta: PaginationMeta }>('/orders', {
      params,
    });
    return {
      orders: res.data.data,
      meta: res.data.meta!,
    };
  },

  async getOrder(id: string) {
    const res = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return res.data.data;
  },

  async trackOrder(id: string) {
    const res = await api.get<ApiResponse<Order>>(`/orders/${id}/track`);
    return res.data.data;
  },

  async cancelOrder(id: string, reason?: string) {
    const res = await api.post<ApiResponse<Order>>(`/orders/${id}/cancel`, { reason });
    return res.data.data;
  },

  async reorder(id: string) {
    const res = await api.get<ApiResponse<unknown>>(`/orders/${id}/reorder`);
    return res.data.data;
  },

  // Payment integration
  async createRazorpayOrder(orderId: string) {
    const res = await api.post<ApiResponse<PaymentOrderResult>>(`/payments/razorpay/${orderId}`);
    return res.data.data;
  },

  async verifyRazorpayPayment(payload: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const res = await api.post<ApiResponse<{ order: Order; alreadyPaid: boolean }>>(
      '/payments/razorpay/verify',
      payload,
    );
    return res.data.data;
  },

  async getPaymentStatus(orderId: string) {
    const res = await api.get<ApiResponse<Order>>(`/payments/status/${orderId}`);
    return res.data.data;
  },
};
