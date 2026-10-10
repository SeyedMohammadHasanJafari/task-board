import { create } from 'zustand';
import type { ActiveUser, RemoteCursor } from '@/types/socket';

interface SocketState {
  isConnected: boolean;
  onlineUsers: ActiveUser[];
  cursors: Record<string, RemoteCursor>;

  setConnected: (status: boolean) => void;
  setOnlineUsers: (users: ActiveUser[]) => void;
  updateCursor: (cursor: RemoteCursor) => void;
  removeCursor: (socketId: string) => void;
  clearRoomData: () => void;
}

export const useSocketStore = create<SocketState>((set) => ({
  isConnected: false,
  onlineUsers: [],
  cursors: {},

  setConnected: (status) => set({ isConnected: status }),

  setOnlineUsers: (users) => set({ onlineUsers: users }),

  updateCursor: (cursor) =>
    set((state) => ({
      cursors: {
        ...state.cursors,
        [cursor.socketId]: cursor,
      },
    })),

  removeCursor: (socketId) =>
    set((state) => {
      const nextCursors = { ...state.cursors };
      delete nextCursors[socketId];
      return { cursors: nextCursors };
    }),

  clearRoomData: () => set({ onlineUsers: [], cursors: {} }),
}));
