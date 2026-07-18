"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, FirestoreError } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';
import { createUserProfile } from '@/lib/firestore-helpers';
import type { UserProfile } from '@/types';

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

/**
 * Retry a Firestore getDoc call with exponential backoff.
 * Handles transient "permission-denied" errors that occur when the auth token
 * hasn't fully propagated to Firestore security rules yet.
 */
async function retryGetDoc<T>(
  ref: ReturnType<typeof doc>,
  maxAttempts: number = 3,
  baseDelayMs: number = 500
): Promise<{ exists: boolean; data: T | null }> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return { exists: true, data: snap.data() as T };
      }
      return { exists: false, data: null };
    } catch (error) {
      const isPermissionDenied =
        error instanceof FirestoreError &&
        (error.code === 'permission-denied' || error.message?.includes('Missing or insufficient permissions'));

      if (!isPermissionDenied || attempt === maxAttempts) {
        throw error;
      }

      // Exponential backoff: 500ms, 1000ms, 2000ms
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`[AuthProvider] getDoc attempt ${attempt} failed with permission-denied, retrying in ${delay}ms`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Unreachable');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      
      if (u) {
        try {
          // Ensure auth token is fully propagated
          await u.getIdToken();
          
          const userRef = doc(db, 'users', u.uid);
          const result = await retryGetDoc<UserProfile>(userRef);
          
          if (result.exists && result.data) {
            setDbUser(result.data);
          } else {
            // Create user profile using the helper function
            await createUserProfile(u.uid, {
              email: u.email || '',
              displayName: u.displayName || u.email?.split('@')[0] || '',
            });
            // Fetch the newly created profile
            const newResult = await retryGetDoc<UserProfile>(userRef);
            if (newResult.exists && newResult.data) {
              setDbUser(newResult.data);
            }
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
    // Use signInWithPopup which is more reliable with ad blockers
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
