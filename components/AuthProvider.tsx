"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
  dbUser: any | null;
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
  const [dbUser, setDbUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUser: (() => void) | null = null;
    const unsubscribeAuth = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (unsubscribeUser) {
        unsubscribeUser();
        unsubscribeUser = null;
      }
      
      if (u) {
        try {
          const userRef = doc(db, 'users', u.uid);
          
          unsubscribeUser = onSnapshot(userRef, async (docSnap) => {
            if (docSnap.exists()) {
              setDbUser(docSnap.data());
            } else {
              // Create if doesn't exist
              const newUser = {
                email: u.email || '',
                points: 0,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                displayName: u.displayName || '',
              };
              await setDoc(userRef, newUser);
              // snapshot will catch it on next tick
            }
            setLoading(false);
          }, (error) => {
            setLoading(false);
            console.error("Auth snapshot error:", error);
          });
          
        } catch (error) {
          setLoading(false);
        }
      } else {
        setDbUser(null);
        setLoading(false);
      }
    });

    return () => {
       unsubscribeAuth();
       if (unsubscribeUser) unsubscribeUser();
    };
  }, []);

  const signIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
       console.error("Sign in failed", error);
       throw error;
    }
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
