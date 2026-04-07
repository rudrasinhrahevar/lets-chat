import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCallStore = create(
  persist(
    (set) => ({
      activeCall: null,
      incomingCall: null,
      callHistory: [],

      setActiveCall: (call) => set({ activeCall: call, incomingCall: null }),
      setIncomingCall: (call) => set({ incomingCall: call }),
      clearCall: () => set({ activeCall: null, incomingCall: null }),
      setCallHistory: (history) => set({ callHistory: history }),
    }),
    {
      name: 'lets-chat-call',
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          // Only persist activeCall, not incomingCall or callHistory
          const filtered = {
            ...value,
            state: {
              ...value.state,
              incomingCall: null,
              callHistory: [],
            },
          };
          sessionStorage.setItem(name, JSON.stringify(filtered));
        },
        removeItem: (name) => sessionStorage.removeItem(name),
      },
    }
  )
);
