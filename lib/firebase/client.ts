"use client";

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  Firestore,
} from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import appletConfig from "../../firebase-applet-config.json";
import { demoDb, demoAuth, demoStorage } from "./demo";

const isBrowser = typeof window !== "undefined";

// Note: measurementId removed to prevent ad blocker interference with Privacy Sandbox features
const useEnv = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID &&
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID
);

// Build config from environment variables or fallback to applet config.
// measurementId is intentionally omitted to prevent ad blocker blocking of Google Analytics.
const firebaseConfig = useEnv
  ? {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
    }
  : appletConfig;

let appRef: FirebaseApp | undefined;
let dbInstance: Firestore | undefined;

function ensureApp(): FirebaseApp {
  if (!appRef) {
    appRef = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return appRef;
}

function ensureDb(): Firestore {
  if (!dbInstance) {
    const theApp = ensureApp();
    try {
      dbInstance = initializeFirestore(theApp, {
        localCache: persistentLocalCache({}),
      });
    } catch {
      dbInstance = getFirestore(theApp);
    }
  }
  return dbInstance;
}

// Firebase services are ONLY usable (and only initialized) in the browser.
// During server-side rendering / static prerendering (e.g. /_not-found) this
// module is still evaluated on the server; calling getAuth/getFirestore there
// throws (e.g. 'auth/invalid-api-key' when build-time env vars are absent).
// On the server we export null so SSR never crashes. All consumers use these
// inside client-only effects/hooks, so null is never touched on the server.
//
// Demo mode (NEXT_PUBLIC_DEMO_MODE=true with no real Firebase keys) swaps in
// an in-memory Firestore/Auth/Storage so the whole app renders without
// backend credentials — used by the design harness evaluator.
const isDemo =
  isBrowser &&
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" &&
  !useEnv;

export const app = isDemo
  ? (null as unknown as FirebaseApp)
  : isBrowser
    ? ensureApp()
    : (null as unknown as FirebaseApp);
export const db = isDemo
  ? (demoDb as unknown as Firestore)
  : isBrowser
    ? ensureDb()
    : (null as unknown as Firestore);
export const auth = isDemo
  ? demoAuth
  : isBrowser
    ? getAuth(ensureApp())
    : (null as unknown as Auth);
export const storage = isDemo
  ? (demoStorage as unknown as FirebaseStorage)
  : isBrowser
    ? getStorage(ensureApp())
    : (null as unknown as FirebaseStorage);

export * from "../shared/firestore-helpers";
export * from "../../hooks/useFirestoreDocument";
export * from "../../hooks/useFirestoreCollection";
