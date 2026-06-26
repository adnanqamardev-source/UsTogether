"use client";

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// CRITICAL: Required explicitly!
export const db = getFirestore(app);
export const auth = getAuth(app);

enableMultiTabIndexedDbPersistence(db).catch(() => {
  // Persistence failed to enable (e.g., unsupported browser or already enabled).
});

export * from './firestore-helpers';
export * from '../hooks/useFirestoreDocument';
export * from '../hooks/useFirestoreCollection';