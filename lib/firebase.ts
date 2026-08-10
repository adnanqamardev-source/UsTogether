"use client";

import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import hardcodedConfig from "../firebase-applet-config.json";

// Support env-var overrides; fall back to the committed config for local dev.
// For production, prefer setting NEXT_PUBLIC_FIREBASE_* env vars.
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || (hardcodedConfig as any).apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || (hardcodedConfig as any).authDomain,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || (hardcodedConfig as any).projectId,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || (hardcodedConfig as any).storageBucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || (hardcodedConfig as any).messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || (hardcodedConfig as any).appId,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || (hardcodedConfig as any).measurementId,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || "(default)");
export const auth = getAuth(app);