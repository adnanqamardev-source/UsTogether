"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';
import type { UserProfile } from '../global.d';
import { createUserProfile } from '@/lib/firebase';

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
    let unsubscribeUser: (() => void) | null = null;
    const unsubscribeAuth = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (unsubscribeUser) {
        unsubscribeUser();
        unsubscribeUser = null;
      }

      if (u) {
        try {
          // Ensure auth token is fully propagated before any Firestore writes
          await u.getIdToken();
          
          const userRef = doc(db, 'users', u.uid);

          unsubscribeUser = onSnapshot(
            userRef,
            async (docSnap: any) => {
              if (docSnap.exists()) {
                const data = docSnap.data() as UserProfile;
                setDbUser(data);
              } else {
                await createUserProfile(u.uid, {
                  email: u.email || '',
                  displayName: u.displayName || u.email?.split('@')[0] || '',
                });
              }
              setLoading(false);
            },
            (error: any) => {
              setLoading(false);
              console.error('Auth snapshot error:', error);
              handleFirestoreError(error, OperationType.GET, `users/${u.uid}`);
            }
          );
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
      await signInWithRedirect(auth, provider);
    } catch (error) {
       console.error("Sign in failed", error);
       throw error;
    }
  };

  // Catch the redirect result when the user returns from the provider.
  useEffect(() => {
    (async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // Credential can be extracted here if needed.
          // For now, onAuthStateChanged will fire and set user/dbUser as usual.
        }
      } catch (error) {
        console.error('Redirect result error:', error);
      }
    })();
  }, []);

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