import * as admin from 'firebase-admin';

let adminApp: admin.app.App | null = null;

function getAdminApp(): admin.app.App {
  if (adminApp) return adminApp;

  const credential = process.env.FIREBASE_ADMIN_CREDENTIALS
    ? admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS))
    : admin.credential.applicationDefault();

  adminApp = admin.initializeApp({ credential });
  return adminApp;
}

export async function verifyIdToken(idToken: string): Promise<{ uid: string } | null> {
  try {
    const app = getAdminApp();
    const decoded = await app.auth().verifyIdToken(idToken);
    return { uid: decoded.uid };
  } catch (error) {
    console.error('Admin token verification failed', error);
    return null;
  }
}
