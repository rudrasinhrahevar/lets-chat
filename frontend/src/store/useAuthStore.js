import { create } from 'zustand';
import api from 'services/api';

// Manual localStorage persistence (CRA-compatible, no zustand/middleware import needed)
const loadPersistedAuth = () => {
  try {
    const raw = localStorage.getItem('auth-store');
    if (raw) { const d = JSON.parse(raw); return { user: d.user || null, accessToken: d.accessToken || null }; }
  } catch {}
  return { user: null, accessToken: null };
};

const persist = (data) => {
  try { localStorage.setItem('auth-store', JSON.stringify({ user: data.user, accessToken: data.accessToken })); } catch {}
};

const initial = loadPersistedAuth();

export const useAuthStore = create((set, get) => ({
  user: initial.user,
  accessToken: initial.accessToken,
  isAuthenticated: !!initial.accessToken,
  isLoading: false,

  setTokens: (accessToken) => { set({ accessToken, isAuthenticated: true }); persist(get()); },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.requiresTwoStep) { set({ isLoading: false }); return { requiresTwoStep: true, userId: data.userId }; }
      set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true, isLoading: false });
      persist(get());
      return data;
    } catch (error) { set({ isLoading: false }); throw error; }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    try { const { data } = await api.post('/auth/register', { name, email, password }); set({ isLoading: false }); return data; }
    catch (error) { set({ isLoading: false }); throw error; }
  },

  verifyOTP: async (userId, otp) => {
    const { data } = await api.post('/auth/verify-otp', { userId, otp });
    set({ user: data.user, accessToken: data.accessToken, isAuthenticated: true });
    persist(get());
    return data;
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch {}
    set({ user: null, accessToken: null, isAuthenticated: false });
    localStorage.removeItem('auth-store');
  },

  refreshToken: async () => {
    try {
      const { data } = await api.post('/auth/refresh-token');
      set({ accessToken: data.accessToken, isAuthenticated: true });
      persist(get());
      return data.accessToken;
    } catch { set({ user: null, accessToken: null, isAuthenticated: false }); localStorage.removeItem('auth-store'); return null; }
  },

  updateUser: (updates) => { set(state => ({ user: { ...state.user, ...updates } })); persist(get()); }
}));
