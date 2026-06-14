import api from './apiClient';
import type { ApiResponse, AppNotification } from '@/types';

export const notificationApi = {
  list: (params?: { page?: number; limit?: number; unread?: boolean }) =>
    api.get<unknown, ApiResponse<AppNotification[]>>('/notifications', { params }),

  markRead: (id: string) => api.put<unknown, ApiResponse<void>>(`/notifications/${id}/read`),

  markAllRead: () => api.put<unknown, ApiResponse<void>>('/notifications/read-all'),

  createForUser: (data: { user_id?: string; type: string; title: string; message: string }) =>
    api.post<unknown, ApiResponse<AppNotification>>('/notifications', data),
};
