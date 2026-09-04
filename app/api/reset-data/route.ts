import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from '@/lib/admin';

const BATCH_SIZE = 500;

export async function POST(request: NextRequest) {
  try {
    // Only allow in development or with proper auth
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
    }

    // Require secret key for security
    const secret = request.headers.get('x-reset-secret');
    const expectedSecret = process.env.RESET_SECRET_KEY;
    
    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json({ error: 'Invalid or missing secret key' }, { status: 401 });
    }

    const app = getAdminApp();
    const db = getFirestore(app);

    // Get all collections
    const usersSnapshot = await db.collection('users').get();
    const coupleSnapshot = await db.collection('couples').get();
    const pairingCodesSnapshot = await db.collection('pairingCodes').get();
    const quizzesSnapshot = await db.collection('quizzes').get();
    const memoryPhotosSnapshot = await db.collection('memory_photos').get();

    // Delete achievements subcollections for each user
    const userPaths: string[] = [];
    for (const userDoc of usersSnapshot.docs) {
      const achievementsSnapshot = await db.collection('achievements').doc(userDoc.id).collection('items').get();
      for (const doc of achievementsSnapshot.docs) {
        userPaths.push(`achievements/${userDoc.id}/items/${doc.id}`);
      }
    }

    // Collect all refs to delete
    const allRefs = [
      ...usersSnapshot.docs,
      ...coupleSnapshot.docs,
      ...pairingCodesSnapshot.docs,
      ...quizzesSnapshot.docs,
      ...memoryPhotosSnapshot.docs,
    ].map((d) => d.ref);

    for (const path of userPaths) {
      const parts = path.split('/');
      allRefs.push(db.doc(parts.join('/')));
    }

    // Delete in batches of 500 (Firestore limit)
    for (let i = 0; i < allRefs.length; i += BATCH_SIZE) {
      const batch = db.batch();
      allRefs.slice(i, i + BATCH_SIZE).forEach((ref) => batch.delete(ref));
      await batch.commit();
    }

    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${usersSnapshot.size} users, ${coupleSnapshot.size} couples, ${pairingCodesSnapshot.size} codes, ${quizzesSnapshot.size} quizzes, ${memoryPhotosSnapshot.size} photos` 
    });
  } catch (error) {
    console.error('Reset data failed', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
