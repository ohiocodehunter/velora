import axios, { AxiosError } from 'axios';
import type { ApiResponse } from '@/types';

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function getErrorMessage(err: unknown, fallback = 'An unexpected error occurred'): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as any;
    if (data?.errors && typeof data.errors === 'object') {
      const messages = Object.values(data.errors).filter(Boolean);
      if (messages.length > 0) return String(messages[0]);
    }
    if (data?.message) return data.message;
    if (typeof err.response?.data === 'string') return err.response.data;
    if (err.message) return err.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

export default api;
