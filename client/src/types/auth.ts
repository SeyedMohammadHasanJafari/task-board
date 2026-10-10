export interface User {
  id: string;
  name: string;
  email?: string;
  avatarColor: string;
  isGuest: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, avatarColor?: string) => Promise<User>;
  loginAsGuest: (name?: string, avatarColor?: string) => Promise<User>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}
