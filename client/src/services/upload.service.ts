import api from './api';
import type { ApiResponse, UploadResult } from '@/types';

export const uploadService = {
  async uploadImages(files: File[]) {
    const formData = new FormData();
    for (const file of files) {
      formData.append('images', file);
    }

    const res = await api.post<ApiResponse<UploadResult>>('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data.images;
  },
};
