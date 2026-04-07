import { create } from 'zustand';

export const useAdminStore = create((set) => ({
  stats: null,
  users: [],
  analytics: null,
  labels: [],
  quickReplies: [],
  catalog: [],
  automations: [],
  agents: [],

  setStats: (stats) => set({ stats }),
  setUsers: (users) => set({ users }),
  setAnalytics: (analytics) => set({ analytics }),
  setLabels: (labels) => set({ labels }),
  setQuickReplies: (quickReplies) => set({ quickReplies }),
  setCatalog: (catalog) => set({ catalog }),
  setAutomations: (automations) => set({ automations }),
  setAgents: (agents) => set({ agents }),
}));
