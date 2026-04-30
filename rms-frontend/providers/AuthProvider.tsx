'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: () => {},
  clearAuth: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('rms_token');
    const storedUser = localStorage.getItem('rms_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('rms_token');
        localStorage.removeItem('rms_user');
      }
    }
    setHydrated(true);
  }, []);

  const setAuth = useCallback((newUser: User, newToken: string) => {
    localStorage.setItem('rms_token', newToken);
    localStorage.setItem('rms_user', JSON.stringify(newUser));
    setUser(newUser);
    setToken(newToken);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('rms_token');
    localStorage.removeItem('rms_user');
    setUser(null);
    setToken(null);
  }, []);

  if (!hydrated) return null; // prevent flash before localStorage is read

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, setAuth, clearAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return useContext(AuthContext);
}
