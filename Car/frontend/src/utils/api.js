import axios from 'axios';
import { API_BASE } from '../config';
import { logout, refreshAuthToken } from './auth';

/**
 * api
 * 
 * A customized Axios instance with global interceptors for
 * authentication and error handling.
 */
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach the appropriate token
api.interceptors.request.use(
  (config) => {
    // Skip attaching token if explicitly requested or if it's an auth-related request
    if (config._skipInterceptor || config.url?.includes('/login/') || config.url?.includes('/register/')) {
      return config;
    }

    // A request is considered 'admin' if:
    // 1. Caller explicitly requests it via useAdminToken flag
    // 2. The API URL contains /admin/ or /workshop/dashboard/
    // 3. The current browser path starts with /admin (only in browser environment)
    const isUrlAdmin = config.url.includes('/admin/') || config.url.includes('/workshop/dashboard/');
    const isPathAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    const isAdmin = config.useAdminToken || isUrlAdmin || isPathAdmin;

    const tokenKey = isAdmin ? 'admin_access_token' : 'user_access_token';
    const token = localStorage.getItem(tokenKey);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refresh & Retries
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't retried yet and not skipped
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest._skipInterceptor) {
      originalRequest._retry = true;

      const isUrlAdmin = originalRequest.url.includes('/admin/') || originalRequest.url.includes('/workshop/dashboard/');
      const isPathAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
      const isAdmin = originalRequest.useAdminToken || isUrlAdmin || isPathAdmin;

      const type = isAdmin ? 'admin' : 'user';
      
      const refreshKey = type === 'admin' ? 'admin_refresh_token' : 'user_refresh_token';
      const refreshToken = localStorage.getItem(refreshKey);

      // Only attempt refresh if we actually have a refresh token
      if (refreshToken) {
        try {
          console.log(`[API] Token expired for ${type}. Attempting refresh...`);
          const newToken = await refreshAuthToken(type);

          if (newToken) {
            console.log(`[API] Refresh successful. Retrying original request.`);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error(`[API] Refresh failed for ${type}:`, refreshError);
        }
      }

      // If we reach here, refresh failed or was not possible
      logout(type);
    }

    return Promise.reject(error);
  }
);

export default api;
