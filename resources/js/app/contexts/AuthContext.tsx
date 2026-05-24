import { createContext, useContext } from 'react';
import type { User } from '../types/auth';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginError: string | null;
  isAuthenticated: boolean;
  hasApiKey: boolean;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  onLogout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginError: null,
  isAuthenticated: false,
  hasApiKey: false,
  onLogin: async () => {},
  onRegister: async () => {},
  onLogout: async () => {},
  clearError: () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);
