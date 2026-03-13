import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { setAuthToken } from './api';

interface User {
  id: string;
  email: string;
  full_name?: string | null;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('vero_access_token');
    const storedUser = localStorage.getItem('vero_user');
    if (storedToken) {
      setAccessToken(storedToken);
      setAuthToken(storedToken);
    }
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { access_token, user: loggedInUser } = response.data;

    setAccessToken(access_token);
    setUser(loggedInUser);
    setAuthToken(access_token);

    localStorage.setItem('vero_access_token', access_token);
    localStorage.setItem('vero_user', JSON.stringify(loggedInUser));
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    setAuthToken(null);
    localStorage.removeItem('vero_access_token');
    localStorage.removeItem('vero_user');
  };

  const value = useMemo(() => ({ user, accessToken, login, logout }), [user, accessToken]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
