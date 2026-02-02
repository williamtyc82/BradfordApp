"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { User } from '@/lib/types';
import { placeholderUsers } from '@/lib/placeholder-data';

type AuthContextType = {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  switchRole: (role: 'worker' | 'manager') => void;
  updateUser: (updates: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string) => {
    // This is a mock login. In a real app, you'd verify credentials.
    // Find an existing user by email. This handles manager and worker logins.
    const existingUser = placeholderUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      setUser(existingUser);
    } else {
      // If no user exists, it's a new signup. Default to a generic worker.
      const defaultWorker = placeholderUsers.find(u => u.role === 'worker');
      if (defaultWorker) {
        setUser(defaultWorker);
      }
    }
  };

  const logout = () => {
    setUser(null);
  };
  
  const switchRole = (role: 'worker' | 'manager') => {
    const newUser = placeholderUsers.find(u => u.role === role);
    if(newUser) {
        setUser(newUser);
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser(prevUser => prevUser ? { ...prevUser, ...updates } : null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
