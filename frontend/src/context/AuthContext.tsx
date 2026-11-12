import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getCurrentUser, setCurrentUser, removeCurrentUser, removeAuthToken, setAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getCurrentUser());

  useEffect(() => {
    const saved = getCurrentUser();
    if (saved) {
      setUser(saved);
    }
  }, []);

  const login = (token: string, userData: User) => {
    setAuthToken(token);
    setCurrentUser(userData);
    setUser(userData);
  };

  const logout = () => {
    removeAuthToken();
    removeCurrentUser();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
