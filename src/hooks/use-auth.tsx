"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User } from '@/lib/types';
import { placeholderUsers } from '@/lib/placeholder-data';
import { Auth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { useFirebase } from '@/firebase/provider';
import { doc, getDoc, setDoc } from 'firebase/firestore';

type AuthContextType = {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  switchRole: (role: 'worker' | 'manager') => void;
  updateUser: (updates: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { auth, firestore } = useFirebase();

  useEffect(() => {
    if (!auth || !firestore) return;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        // Fetch user profile and manager status
        const [userDocSnap, managerDocSnap] = await Promise.all([
          getDoc(doc(firestore, "users", fbUser.uid)),
          getDoc(doc(firestore, "roles_manager", fbUser.uid))
        ]);

        if (userDocSnap.exists()) {
          const userProfile = userDocSnap.data() as User;
          let isActuallyManager = managerDocSnap.exists();

          // Self-healing: If user profile says manager but record is missing, create it.
          if (userProfile.role === 'manager' && !isActuallyManager) {
            console.log("AuthProvider: Self-healing missing roles_manager record for:", fbUser.uid);
            try {
              await setDoc(doc(firestore, "roles_manager", fbUser.uid), {
                createdAt: new Date().toISOString(),
                autoHealed: true
              });
              isActuallyManager = true;
            } catch (e) {
              console.error("AuthProvider: Self-healing failed:", e);
            }
          }

          const now = new Date().toISOString();

          // Update lastLogin in Firestore asynchronously
          // We don't await this to avoid blocking the UI
          setDoc(doc(firestore, "users", fbUser.uid), { lastLogin: now }, { merge: true })
            .catch(err => console.error("Error updating lastLogin:", err));

          setUser({
            ...userProfile,
            id: fbUser.uid,
            role: isActuallyManager ? 'manager' : 'worker',
            photoURL: fbUser.photoURL || `https://picsum.photos/seed/${fbUser.uid}/100/100`,
            createdAt: userProfile.createdAt || now,
            lastLogin: now,
          });
        } else {
          // Fallback if no user document exists yet
          setUser({
            id: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'User',
            role: managerDocSnap.exists() ? 'manager' : 'worker',
            photoURL: fbUser.photoURL || `https://picsum.photos/seed/${fbUser.uid}/100/100`,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  const switchRole = (role: 'worker' | 'manager') => {
    // This is a demo feature. It finds a placeholder user with the target role and logs them in.
    // This won't work correctly with real Firestore rules unless we manipulate the roles_manager collection.
    // For now, we just switch the local user object for UI purposes.
    if (user) {
      const targetEmail = role === 'manager' ? 'manager@bradford.co' : 'worker1@bradford.co';
      // In a real scenario, you would not do this. This is for demo purposes.
      alert(`Role switching is a demo feature. To properly test roles, please sign out and sign in as ${targetEmail}`);
      const newUser = placeholderUsers.find(u => u.role === role);
      if (newUser) {
        setUser({ ...user, role: newUser.role, email: newUser.email, displayName: newUser.displayName });
      }
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser(prevUser => prevUser ? { ...prevUser, ...updates } : null);
      // Here you would also update the user profile in Firestore
    }
  };

  const value = { user, firebaseUser, loading, switchRole, updateUser };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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
