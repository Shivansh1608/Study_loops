import { create } from 'zustand';

export interface User {
  id: number;
  email: string;
  created_at?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('notes_quiz_token'),
  user: null,
  isAuthenticated: !!localStorage.getItem('notes_quiz_token'),
  isLoading: true,

  setAuth: (token: string, user: User) => {
    localStorage.setItem('notes_quiz_token', token);
    set({ token, user, isAuthenticated: true, isLoading: false });
  },

  setUser: (user: User) => {
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('notes_quiz_token');
    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
  },

  initialize: () => {
    const token = localStorage.getItem('notes_quiz_token');
    set({ token, isAuthenticated: !!token, isLoading: false });
  },
}));
