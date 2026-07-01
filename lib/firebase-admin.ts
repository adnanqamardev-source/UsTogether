import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK for server-side token verification.
// Falls back to default credentials if a raw JSON service account is not provided.
const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

let serviceAccount: any;
if (serviceAccountEnv) {
  try {
    serviceAccount = JSON.parse(serviceAccountEnv);
  } catch (e) {
    console.warn('Invalid FIREBASE_SERVICE_ACCOUNT_KEY env var, falling back to default credentials.');
  }
}

let appInstance: any;
try {
  appInstance = initializeApp({
    credential: serviceAccount
      ? cert(serviceAccount)
      : undefined, // undefined => application default credentials
  });
} catch (e) {
  // App may already be initialized in tests or hot reload
  appInstance = undefined;
}

export const adminAuth: Auth = getAuth(appInstance);
