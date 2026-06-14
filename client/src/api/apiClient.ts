import axios, { AxiosError, type AxiosResponse } from 'axios';
import { API_BASE } from '@/lib/constant';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

/* -------- Request: inject Bearer token -------- */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* -------- Response: unwrap to { success, data, message, meta } -------- */
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (res: AxiosResponse) => res.data,
  async (error: AxiosError<{ message?: string }>) => {
    const original = error.config;
    if (!original) return Promise.reject(error.response?.data ?? error);

    /* 401 → try refresh once */
    const isAuthEndpoint = original.url?.includes('/auth/');
    if (error.response?.status === 401 && !isAuthEndpoint && !(original as any)._retry) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // hard logout
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(error.response.data ?? error);
      }

      if (isRefreshing) {
        // queue concurrent requests until refresh completes
        return new Promise((resolve) => {
          refreshSubscribers.push((newToken) => {
            if (original.headers) original.headers.Authorization = `Bearer ${newToken}`;
            (original as any)._retry = true;
            resolve(api(original));
          });
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post(
          `${API_BASE}/auth/refresh`,
          { refresh_token: refreshToken },
          { withCredentials: true },
        );
        const newToken = data?.data?.token as string;
        if (!newToken) throw new Error('No token in refresh response');
        localStorage.setItem('token', newToken);
        onRefreshed(newToken);
        if (original.headers) original.headers.Authorization = `Bearer ${newToken}`;
        (original as any)._retry = true;
        return api(original);
      } catch (refreshErr) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error.response?.data ?? error);
  },
);

export default api;
