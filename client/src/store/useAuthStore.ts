import { create } from 'zustand';
import { api } from '@/lib/api';
import type { User, AuthResponse, AuthState } from '@/types/auth';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getStoredUser(),
  token: localStorage.getItem(TOKEN_KEY),
  isAuthenticated: !!localStorage.getItem(TOKEN_KEY),
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<AuthResponse>('/auth/login', { email, password });
      const { user, token } = res.data;

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return user;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  register: async (name: string, email: string, password: string, avatarColor?: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<AuthResponse>('/auth/register', {
        name,
        email,
        password,
        avatarColor,
      });
      const { user, token } = res.data;

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return user;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  loginAsGuest: async (customName?: string, customColor?: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<AuthResponse>('/auth/guest', {
        name: customName,
        avatarColor: customColor,
      });
      const { user, token } = res.data;

      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return user;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Guest access failed';
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      get().logout();
      return;
    }

    try {
      const res = await api.get<{ success: boolean; user: User }>('/auth/me');
      const user = res.data.user;
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user, isAuthenticated: true });
    } catch {
      // If token expired or invalid, log out cleanly
      get().logout();
    }
  },
}));
