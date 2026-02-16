import axios from 'axios';
import { sessionStore } from '@lib/storage';

let currentBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '';

export function setApiBaseUrl(url: string): void {
  currentBaseUrl = url;
  apiClient.defaults.baseURL = url;
}

const apiClient = axios.create({
  baseURL: currentBaseUrl,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach Bearer token from session storage
apiClient.interceptors.request.use(async (config) => {
  const token = await sessionStore.get('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 with token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await sessionStore.get('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${currentBaseUrl}/auth/refresh-token`, {
          refreshToken,
        });

        const newToken = data?.data?.token;
        const newRefresh = data?.data?.refreshToken;

        if (newToken) {
          await sessionStore.setMany({
            authToken: newToken,
            refreshToken: newRefresh ?? refreshToken,
          });
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        // Refresh failed — clear session
        await sessionStore.clear();
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
