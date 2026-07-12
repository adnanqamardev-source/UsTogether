"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '../global.d';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
  dbUser: UserProfile | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  logOut: async () => {},
  dbUser: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      
      if (u) {
        try {
          await u.getIdToken();
          const userRef = doc(db, 'users', u.uid);
          const docSnap = await getDoc(userRef);
          
          if (docSnap.exists()) {
            setDbUser(docSnap.data() as UserProfile);
          } else {
            const now = Date.now();
            const profileData: UserProfile = {
              email: u.email || '',
              displayName: u.displayName || u.email?.split('@')[0] || '',
              points: 0,
              createdAt: now,
              updatedAt: now,
            };
            await setDoc(userRef, profileData);
            setDbUser(profileData);
          }
        } catch (error) {
          console.error('Auth error:', error);
        }
      } else {
        setDbUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logOut = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logOut, dbUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);