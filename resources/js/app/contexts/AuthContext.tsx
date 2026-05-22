import { createContext, useContext } from 'react';
import type { User } from '../types/auth';

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginError: string | null;
  isAuthenticated: boolean;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  onLogout: () => Promise<void>;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginError: null,
  isAuthenticated: false,
  onLogin: async () => {},
  onRegister: async () => {},
  onLogout: async () => {},
  clearError: () => {},
});

export const useAuth = () => useContext(AuthContext);
