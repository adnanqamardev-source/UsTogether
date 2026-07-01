import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { UserProfile } from '../global.d';

function toISODate(date: Date): string {
  return date.toLocaleDateString('en-CA');
}

function yesterday(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return toISODate(d);
}

export async function updateStreak(userId: string): Promise<{ streak: number; unlocked: string[] }> {
  const userRef = doc(db, 'users', userId);
  const { getDoc, setDoc, serverTimestamp } = await import('firebase/firestore');

  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    throw new Error('User profile not found');
  }

  const profile = snap.data() as UserProfile;
  const today = toISODate(new Date());
  let newStreak: number;

  if (profile.lastActiveDate === today) {
    return { streak: profile.streak ?? 0, unlocked: [] };
  } else if (profile.lastActiveDate === yesterday(new Date())) {
    newStreak = (profile.streak ?? 0) + 1;
  } else {
    newStreak = 1;
  }

  await setDoc(userRef, {
    streak: newStreak,
    lastActiveDate: today,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  return { streak: newStreak, unlocked: [] };
}