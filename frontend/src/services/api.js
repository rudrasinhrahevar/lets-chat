import axios from 'axios';
import { useAuthStore } from 'store/useAuthStore';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
  timeout: 30000
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue = [];
const processQueue = (error, token = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token));
  failedQueue = [];
};

api.interceptors.response.use(
  res => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => { original.headers.Authorization = `Bearer ${token}`; return api(original); });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const token = await useAuthStore.getState().refreshToken();
        if (token) { processQueue(null, token); original.headers.Authorization = `Bearer ${token}`; return api(original); }
      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
      } finally { isRefreshing = false; }
    }
    return Promise.reject(error);
  }
);

export default api;
