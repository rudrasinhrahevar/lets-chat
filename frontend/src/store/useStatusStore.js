import { create } from 'zustand';

export const useStatusStore = create((set) => ({
  statuses: [],
  myStatuses: [],
  viewingStatus: null,

  setStatuses: (statuses) => set({ statuses }),
  setMyStatuses: (myStatuses) => set({ myStatuses }),
  setViewingStatus: (status) => set({ viewingStatus: status }),
  addStatus: (status) => set(state => ({ myStatuses: [status, ...state.myStatuses] })),
}));
