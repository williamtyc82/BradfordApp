"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { User } from '@/lib/types';
import { placeholderUsers } from '@/lib/placeholder-data';

type AuthContextType = {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  switchRole: (role: 'worker' | 'manager') => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string) => {
    // This is a mock login. In a real app, you'd verify credentials.
    // For now, we'll just find a user and set them. Default to worker.
    const potentialUser = placeholderUsers.find(u => u.role === 'worker');
    if (potentialUser) {
      setUser(potentialUser);
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

  return (
    <AuthContext.Provider value={{ user, login, logout, switchRole }}>
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
