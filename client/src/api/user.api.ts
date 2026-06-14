import api from './apiClient';
import type { ApiResponse, User, Hotel, ActivityLog, Booking } from '@/types';

export const userApi = {
  listAll: () => api.get<unknown, ApiResponse<User[]>>('/users'),

  getMe: () => api.get<unknown, ApiResponse<User>>('/users/me'),

  getById: (id: string) => api.get<unknown, ApiResponse<User>>(`/users/${id}`),

  getMyBookings: () => api.get<unknown, ApiResponse<Booking[]>>('/users/bookings'),

  changePassword: (data: { old_password: string; new_password: string }) =>
    api.put<unknown, ApiResponse<void>>('/users/me/change-password', data),

  requestEmailChange: (data: { new_email: string }) =>
    api.post<unknown, ApiResponse<void>>('/users/me/change-email', data),

  verifyEmailChange: (data: { new_email: string; otp: string }) =>
    api.put<unknown, ApiResponse<void>>('/users/me/verify-email-change', data),

  uploadAvatar: (file: File) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.post<unknown, ApiResponse<{ image: string }>>('/users/me/upload-avatar', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updatePreferences: (data: Record<string, unknown>) =>
    api.put<unknown, ApiResponse<User>>('/users/me/preferences', data),

  getWishlist: () => api.get<unknown, ApiResponse<Hotel[]>>('/users/me/wishlist'),

  addWishlist: (hotelId: string) =>
    api.post<unknown, ApiResponse<void>>(`/users/me/wishlist/${hotelId}`),

  removeWishlist: (hotelId: string) =>
    api.delete<unknown, ApiResponse<void>>(`/users/me/wishlist/${hotelId}`),

  toggleFavorite: (hotelId: string) =>
    api.post<unknown, ApiResponse<{ favorited: boolean }>>(`/users/me/favorite/${hotelId}`),

  getActivity: () => api.get<unknown, ApiResponse<ActivityLog[]>>('/users/me/activity'),

  deleteAccount: () => api.delete<unknown, ApiResponse<void>>('/users/me/delete-account'),

  exportData: () => api.get<unknown, ApiResponse<Record<string, unknown>>>('/users/me/data/export'),

  /* ---- Admin ---- */
  adminAdd: (data: FormData) =>
    api.post<unknown, ApiResponse<User>>('/users/add', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  adminUpdate: (id: string, data: Record<string, unknown>) =>
    api.put<unknown, ApiResponse<User>>(`/users/edit/${id}`, data),
  adminDelete: (id: string) => api.delete<unknown, ApiResponse<void>>(`/users/delete/${id}`),
};
