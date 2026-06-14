import api from './apiClient';
import type { ApiResponse, Hotel, PriceBreakdown } from '@/types';

export interface HotelSearchParams {
  city?: string;
  city_id?: string;
  hotelType?: string;
  checkIn?: string;
  checkOut?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  guests?: number;
  page?: number;
  limit?: number;
  sort?: string;
}

export const hotelApi = {
  list: (page = 1, limit = 20) =>
    api.get<unknown, ApiResponse<Hotel[]>>('/hotels', { params: { page, limit } }),

  getById: (id: string) => api.get<unknown, ApiResponse<Hotel>>(`/hotels/${id}`),

  search: (params: HotelSearchParams) =>
    api.get<unknown, ApiResponse<Hotel[]>>('/hotels/search', { params }),

  recommendations: () => api.get<unknown, ApiResponse<Hotel[]>>('/hotels/recommendations'),

  destinations: () =>
    api.get<unknown, ApiResponse<Array<{ _id: string; name: string; image?: string; count: number }>>>(
      '/hotels/destination',
    ),

  pending: () => api.get<unknown, ApiResponse<Hotel[]>>('/hotels/pending'),

  my: () => api.get<unknown, ApiResponse<Hotel[]>>('/hotels/my'),

  create: (formData: FormData) =>
    api.post<unknown, ApiResponse<Hotel>>('/hotels/add', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, formData: FormData) =>
    api.put<unknown, ApiResponse<Hotel>>(`/hotels/edit/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id: string) => api.delete<unknown, ApiResponse<void>>(`/hotels/delete/${id}`),

  updateStatus: (id: string, status: 'approved' | 'pending' | 'rejected') =>
    api.put<unknown, ApiResponse<Hotel>>(`/hotels/status/${id}`, { status }),

  pricePredict: (data: { roomId: string; checkIn: string; checkOut: string }) =>
    api.post<unknown, ApiResponse<PriceBreakdown>>('/hotels/price-predict', data),
};
