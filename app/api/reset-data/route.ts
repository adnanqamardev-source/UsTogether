import { NextRequest, NextResponse } from 'next/server';
import { getFirestore } from 'firebase-admin/firestore';
import { getAdminApp } from '@/lib/admin';

export async function POST(request: NextRequest) {
  try {
    // Only allow in development or with proper auth
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 });
    }

    const app = getAdminApp();
    const db = getFirestore(app);

    // Get all users and delete them
    const usersSnapshot = await db.collection('users').get();
    const coupleSnapshot = await db.collection('couples').get();
    const pairingCodesSnapshot = await db.collection('pairingCodes').get();
    const quizzesSnapshot = await db.collection('quizzes').get();
    const memoryPhotosSnapshot = await db.collection('memory_photos').get();

    const batch = db.batch();
    
    // Delete all users
    usersSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    
    // Delete all couples
    coupleSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    
    // Delete all pairing codes
    pairingCodesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    
    // Delete all quizzes
    quizzesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    
    // Delete all memory photos
    memoryPhotosSnapshot.docs.forEach(doc => batch.delete(doc.ref));

    // Delete achievements subcollections for each user
    for (const userDoc of usersSnapshot.docs) {
      const achievementsSnapshot = await db.collection('achievements').doc(userDoc.id).collection('items').get();
      achievementsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    }

    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${usersSnapshot.size} users, ${coupleSnapshot.size} couples, ${pairingCodesSnapshot.size} codes, ${quizzesSnapshot.size} quizzes, ${memoryPhotosSnapshot.size} photos` 
    });
  } catch (error: any) {
    console.error('Reset data failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'POST to this endpoint to reset all user data. Only works in development.' 
  });
}