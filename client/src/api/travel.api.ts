import api from './apiClient';
import type { ApiResponse, TravelPackage, TravelBooking } from '@/types';

export const travelApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<unknown, ApiResponse<TravelPackage[]>>('/travel/packages', { params }),

  getById: (id: string) =>
    api.get<unknown, ApiResponse<TravelPackage>>(`/travel/packages/${id}`),

  destinations: () =>
    api.get<unknown, ApiResponse<Array<{ _id: string; name: string; image?: string; count: number }>>>(
      '/travel/destinations',
    ),

  recommendations: () =>
    api.get<unknown, ApiResponse<TravelPackage[]>>('/travel/recommendations'),

  create: (data: Record<string, unknown>) =>
    api.post<unknown, ApiResponse<TravelPackage>>('/travel/packages/add', data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put<unknown, ApiResponse<TravelPackage>>(`/travel/packages/edit/${id}`, data),

  delete: (id: string) => api.delete<unknown, ApiResponse<void>>(`/travel/packages/delete/${id}`),

  book: (data: Record<string, unknown>) =>
    api.post<unknown, ApiResponse<TravelBooking>>('/travel/book', data),

  myBookings: () => api.get<unknown, ApiResponse<TravelBooking[]>>('/travel/my-bookings'),

  bookingById: (id: string) =>
    api.get<unknown, ApiResponse<TravelBooking>>(`/travel/booking/${id}`),

  cancelBooking: (id: string, reason?: string) =>
    api.put<unknown, ApiResponse<TravelBooking>>(`/travel/booking/cancel/${id}`, { reason }),
};
