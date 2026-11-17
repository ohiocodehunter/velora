import api from './api';
import type { Address, ApiResponse } from '@/types';

export interface AddressPayload {
  label?: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  isDefault?: boolean;
}

export const addressService = {
  async getAddresses() {
    const res = await api.get<ApiResponse<Address[]>>('/addresses');
    return res.data.data;
  },

  async createAddress(data: AddressPayload) {
    const res = await api.post<ApiResponse<Address>>('/addresses', data);
    return res.data.data;
  },

  async updateAddress(id: string, data: Partial<AddressPayload>) {
    const res = await api.patch<ApiResponse<Address>>(`/addresses/${id}`, data);
    return res.data.data;
  },

  async deleteAddress(id: string) {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/addresses/${id}`);
    return res.data;
  },

  async setDefaultAddress(id: string) {
    const res = await api.patch<ApiResponse<Address>>(`/addresses/${id}/default`);
    return res.data.data;
  },
};
