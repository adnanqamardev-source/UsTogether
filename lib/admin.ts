import { initializeApp, App, Credential, applicationDefault, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let adminApp: App | null = null;

function getAdminApp(): App {
  if (adminApp) return adminApp;

  const cred: Credential = process.env.FIREBASE_ADMIN_CREDENTIALS
    ? cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS))
    : applicationDefault();

  adminApp = initializeApp({ credential: cred });
  return adminApp;
}

export async function verifyIdToken(idToken: string): Promise<{ uid: string } | null> {
  try {
    const app = getAdminApp();
    const decoded = await getAuth(app).verifyIdToken(idToken);
    return { uid: decoded.uid };
  } catch (error) {
    console.error('Admin token verification failed', error);
    return null;
  }
}
