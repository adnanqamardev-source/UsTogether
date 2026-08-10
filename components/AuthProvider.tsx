"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { handleFirestoreError, OperationType } from "@/lib/firestore-errors";

export interface DbUser {
  email: string;
  points: number;
  createdAt: number;
  updatedAt: number;
  displayName?: string;
  pairedCoupleId?: string | null;
}

interface AuthContextValue {
  user: User | null;
  dbUser: DbUser | null;
  loading: boolean;
  myCode: string | null;
  signIn: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Derive the pairing code from the user UID (8-char uppercase). */
export function codeFromUid(uid: string): string {
  return uid.substring(0, 8).toUpperCase();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [myCode, setMyCode] = useState<string | null>(null);

  useEffect(() => {
    let unsubUser: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);

      // Clear the previous user-subscription before switching users.
      if (unsubUser) {
        unsubUser();
        unsubUser = null;
      }
      setDbUser(null);
      setMyCode(null);

      if (!u) {
        setLoading(false);
        return;
      }

      // Register the pairing code for this user (idempotent).
      const code = codeFromUid(u.uid);
      setMyCode(code);
      try {
        await setDoc(
          doc(db, "pairingCodes", code),
          { userId: u.uid, createdAt: Date.now() },
          { merge: true }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, "pairingCodes", u);
      }

      // Subscribe to the user doc; create it if missing.
      const userRef = doc(db, "users", u.uid);
      unsubUser = onSnapshot(
        userRef,
        (snap) => {
          if (snap.exists()) {
            setDbUser(snap.data() as DbUser);
          } else {
            const newUser: DbUser = {
              email: u.email || "",
              points: 0,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              displayName: u.displayName || "",
            };
            void setDoc(userRef, newUser).catch((err) =>
              handleFirestoreError(err, OperationType.CREATE, "users", u)
            );
            setDbUser(newUser);
          }
          setLoading(false);
        },
        (err) => {
          handleFirestoreError(err, OperationType.GET, "users", u);
          setLoading(false);
        }
      );
    });

    return () => {
      unsubAuth();
      if (unsubUser) unsubUser();
    };
  }, []);

  const signIn = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }, []);

  const logOut = useCallback(async () => {
    await signOut(auth);
  }, []);

  return (
    <AuthContext.Provider value={{ user, dbUser, loading, myCode, signIn, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}