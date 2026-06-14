import type { ApiResponse, City, Blog, Hero, Facility, Service, Policy, Coupon } from '@/types';
import api from './apiClient';

/* ---------- factory to reduce boilerplate ---------- */
function crudFactory<T>(base: string) {
  return {
    list: () => api.get<unknown, ApiResponse<T[]>>(base),
    getById: (id: string) => api.get<unknown, ApiResponse<T>>(`${base}/${id}`),
    create: (data: Record<string, unknown> | FormData) =>
      api.post<unknown, ApiResponse<T>>(
        `${base}/add`,
        data,
        data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined,
      ),
    update: (id: string, data: Record<string, unknown> | FormData) =>
      api.put<unknown, ApiResponse<T>>(
        `${base}/edit/${id}`,
        data,
        data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined,
      ),
    delete: (id: string) => api.delete<unknown, ApiResponse<void>>(`${base}/delete/${id}`),
  };
}

export const cityApi = crudFactory<City>('/cities');
export const blogApi = crudFactory<Blog>('/blogs');
export const heroApi = crudFactory<Hero>('/heroes');
export const facilityApi = crudFactory<Facility>('/facilities');
export const serviceApi = crudFactory<Service>('/services');

/* Policy needs different update path */
export const policyApi = {
  ...crudFactory<Policy>('/policies'),
  update: (id: string, data: Record<string, unknown>) =>
    api.put<unknown, ApiResponse<Policy>>(`/policies/update/${id}`, data),
};

export const couponApi = {
  list: () => Promise.resolve({ success: true, message: 'mock', data: [] as Coupon[] }),
};

