import api from './apiClient';
import type { ApiResponse, Room } from '@/types';

export const roomApi = {
  list: (hotel_id?: string) =>
    api.get<unknown, ApiResponse<Room[]>>('/rooms', { params: { hotel_id } }),

  getById: (id: string) => api.get<unknown, ApiResponse<Room>>(`/rooms/${id}`),

  available: (params: { hotel_id: string; check_in: string; check_out: string; num?: number }) =>
    api.get<unknown, ApiResponse<Room[]>>('/rooms/available', { params }),

  create: (data: Record<string, unknown> | FormData) => {
    const isForm = data instanceof FormData;
    return api.post<unknown, ApiResponse<Room>>('/rooms/add', data, {
      headers: isForm ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
  },

  update: (id: string, data: Record<string, unknown> | FormData) => {
    const isForm = data instanceof FormData;
    return api.put<unknown, ApiResponse<Room>>(`/rooms/edit/${id}`, data, {
      headers: isForm ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
  },

  delete: (id: string) => api.delete<unknown, ApiResponse<void>>(`/rooms/delete/${id}`),

  removeImage: (id: string, url: string) =>
    api.delete<unknown, ApiResponse<Room>>(`/rooms/remove-image/${id}`, { params: { url } }),
};
