import api from './apiClient';
import type { ApiResponse, Review } from '@/types';

export const reviewApi = {
  forHotel: (hotelId: string, page = 1, limit = 10) =>
    api.get<unknown, ApiResponse<Review[]>>(`/reviews/hotel/${hotelId}`, {
      params: { page, limit },
    }),

  my: () => api.get<unknown, ApiResponse<Review[]>>('/reviews/user/my'),

  create: (formData: FormData) =>
    api.post<unknown, ApiResponse<Review>>('/reviews/add', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, data: Record<string, unknown>) =>
    api.put<unknown, ApiResponse<Review>>(`/reviews/edit/${id}`, data),

  delete: (id: string) => api.delete<unknown, ApiResponse<void>>(`/reviews/delete/${id}`),

  markHelpful: (id: string) =>
    api.post<unknown, ApiResponse<{ helpful_count: number }>>(`/reviews/${id}/helpful`),

  respond: (id: string, response: string) =>
    api.post<unknown, ApiResponse<Review>>(`/reviews/${id}/respond`, { response }),

  setStatus: (id: string, status: 'pending' | 'approved' | 'rejected') =>
    api.put<unknown, ApiResponse<Review>>(`/reviews/${id}/status`, { status }),
};
