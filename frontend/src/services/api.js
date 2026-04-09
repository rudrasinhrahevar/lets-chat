import axios from 'axios';
import { useAuthStore } from 'store/useAuthStore';

const resolveBaseURL = () => {
  const fromEnv = process.env.REACT_APP_API_URL;
  if (fromEnv) return fromEnv;

  // CRA bakes env at build time; on Vercel a missing REACT_APP_API_URL would
  // incorrectly fall back to localhost from users' browsers.
  const isBrowser = typeof window !== 'undefined';
  if (isBrowser) {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1';
    if (!isLocal) {
      // Prefer a same-origin proxy if configured (e.g. Vercel rewrite),
      // but surface a clear error to prevent silent misconfiguration.
      // This still allows teams to set up `/api` rewrites later without code changes.
      console.error(
        '[API] REACT_APP_API_URL is not set. In production you must set it to your backend, ' +
        "e.g. 'https://your-backend.com/api'. Falling back to same-origin '/api'."
      );
      return `${window.location.origin}/api`;
    }
  }

  return 'http://localhost:3001/api';
};

const api = axios.create({
  baseURL: resolveBaseURL(),
  withCredentials: true,
  timeout: 15000 // 15s default (was 30s)
});

// ─── Request interceptor: attach JWT ───
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Longer timeout for uploads
  if (config.url?.includes('/upload') || config.headers?.['Content-Type']?.includes('multipart')) {
    config.timeout = 60000; // 60s for uploads
  }

  return config;
});

// ─── Retry logic with exponential backoff ───
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // 1s, 2s, 4s

const shouldRetry = (error) => {
  // Don't retry auth errors or client errors
  if (error.response?.status >= 400 && error.response?.status < 500) return false;
  // Retry on network errors, timeouts, 5xx
  if (!error.response) return true; // Network error
  if (error.response?.status >= 500) return true;
  if (error.code === 'ECONNABORTED') return true; // Timeout
  return false;
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Request deduplication ───
const inflightRequests = new Map();

// ─── Response interceptor: retry + refresh ───
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

    // ─── Retry logic ───
    if (!original._retryCount) original._retryCount = 0;
    if (shouldRetry(error) && original._retryCount < MAX_RETRIES) {
      original._retryCount++;
      const delay = RETRY_DELAYS[original._retryCount - 1] || 4000;
      await sleep(delay);
      return api(original);
    }

    // ─── Token refresh ───
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const token = await useAuthStore.getState().refreshToken();
        if (token) {
          processQueue(null, token);
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        }
      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Deduplicated GET helper ───
export const deduplicatedGet = async (url, config) => {
  const key = `${url}_${JSON.stringify(config?.params || {})}`;
  if (inflightRequests.has(key)) {
    return inflightRequests.get(key);
  }
  const promise = api.get(url, config).finally(() => {
    inflightRequests.delete(key);
  });
  inflightRequests.set(key, promise);
  return promise;
};

export default api;
