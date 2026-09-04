"use client";

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import appletConfig from '../../firebase-applet-config.json';

// Note: measurementId removed to prevent ad blocker interference with Privacy Sandbox features
const useEnv = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID
);

// Build config from environment variables or fallback to applet config
// measurementId is intentionally omitted to prevent ad blocker blocking of Google Analytics
const firebaseConfig = useEnv
  ? {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }
  : appletConfig;

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Use the modern `FirestoreSettings.localCache` API (replaces the deprecated
// enableMultiTabIndexedDbPersistence()). initializeFirestore throws if the
// Firestore instance was already created (e.g. during HMR), so fall back to
// getFirestore in that case.
let db: ReturnType<typeof getFirestore>;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({}),
  });
} catch {
  db = getFirestore(app);
}

const auth = getAuth(app);

export { db, auth };
export const storage = getStorage(app);

export * from '../shared/firestore-helpers';
export * from '../../hooks/useFirestoreDocument';
export * from '../../hooks/useFirestoreCollection';
