import api from './apiClient';
import type { ApiResponse, User, OtpType } from '@/types';

export const authApi = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    role?: 'user' | 'owner';
  }) =>
    api.post<unknown, ApiResponse<{ user: User; otpRequired: boolean }>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<unknown, ApiResponse<{ user: User; token: string; refresh_token: string }>>(
      '/auth/login',
      data,
    ),

  logout: () => api.post<unknown, ApiResponse<void>>('/auth/logout'),

  verify: () => api.get<unknown, ApiResponse<{ user: User }>>('/auth/verify'),

  refresh: (refresh_token: string) =>
    api.post<unknown, ApiResponse<{ token: string }>>('/auth/refresh', { refresh_token }),

  sendOtp: (data: { email: string; type: OtpType; new_email?: string }) =>
    api.post<unknown, ApiResponse<void>>('/auth/send-otp', data),

  verifyOtp: (data: { email: string; otp: string; type: OtpType }) =>
    api.post<unknown, ApiResponse<void>>('/auth/verify-otp', data),

  resetPassword: (data: { email: string; otp: string; new_password: string }) =>
    api.post<unknown, ApiResponse<void>>('/auth/reset-password', data),

  unlinkGoogle: () => api.post<unknown, ApiResponse<void>>('/auth/google/unlink'),
};
