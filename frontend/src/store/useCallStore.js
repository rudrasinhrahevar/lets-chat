import { create } from 'zustand';

export const useCallStore = create((set) => ({
  activeCall: null,
  incomingCall: null,
  callHistory: [],

  setActiveCall: (call) => set({ activeCall: call }),
  setIncomingCall: (call) => set({ incomingCall: call }),
  clearCall: () => set({ activeCall: null, incomingCall: null }),
  setCallHistory: (history) => set({ callHistory: history }),
}));
