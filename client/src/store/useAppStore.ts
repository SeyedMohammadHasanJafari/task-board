import { create } from 'zustand';

interface AppState {
  isServerConnected: boolean;
  isDbConnected: boolean;
  apiLatencyMs: number | null;
  serverMessage: string | null;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setConnectionStatus: (status: {
    isServerConnected: boolean;
    isDbConnected: boolean;
    apiLatencyMs?: number | null;
    serverMessage?: string | null;
  }) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isServerConnected: false,
  isDbConnected: false,
  apiLatencyMs: null,
  serverMessage: null,
  isSidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 768 : true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setConnectionStatus: (status) =>
    set((state) => ({
      ...state,
      ...status,
    })),
}));
