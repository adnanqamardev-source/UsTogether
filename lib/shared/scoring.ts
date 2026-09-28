import { doc, getDoc } from '@/lib/firestore';
import { db } from '@/lib/firebase/client';
import { batchWrite } from './firestore-helpers';
import { isMember, PairingError } from './couple-pairing';
import { checkAndAwardAchievements } from '@/lib/shared/achievements';
import type { Couple, Session } from '@/types';

// Scoring module: one deep module owning the Session-finish scoring shape
// behind a small interface.
//
// The interface is the finish path: callers learn the signature plus the
// idempotency invariant below, and nothing about how the reads and writes
// are composed. The composition (couple read, session read, status guard,
// 2-write finish shape) hides inside the module, which is where the depth
// lives: much leverage for callers, one place to change. That locality is
// the point — finish previously lived as duplicated inline status updates
// in two separate handlers, so an award change had to be made twice.
// Now it is made here once.
//
// The Firestore layout is the seam this module hides: callers never build
// document paths or score payloads themselves.

// Tunable award per finished session. Change here; every finish path
// inherits it through the single interface below.
export const POINTS_PER_SESSION = 10;

export interface FinishScoreResult {
  awarded: boolean;
  totalScore: number;
}

// Invariant: a session awards points at most once. The session status is
// the idempotency guard — a second finish call reads 'finished' and
// returns without writing, so retries and double-clicks cannot
// double-award. Membership is verified against the stored Couple fields
// before any write, consistent with the rules' membership model.
export async function finishSessionWithScore(
  coupleId: string,
  sessionId: string,
  currentUid: string
): Promise<FinishScoreResult> {
  const coupleSnap = await getDoc(doc(db, 'couples', coupleId));
  const couple = coupleSnap.exists() ? (coupleSnap.data() as Couple) : null;
  if (!isMember(couple, currentUid)) {
    throw new PairingError('not-member', 'User is not a member of this Couple.');
  }

  const sessionSnap = await getDoc(doc(db, 'couples', coupleId, 'sessions', sessionId));
  if (!sessionSnap.exists()) {
    throw new Error('session-not-found');
  }
  const session = sessionSnap.data() as Session;
  const currentTotal = couple?.totalScore ?? 0;

  if (session.status === 'finished') {
    return { awarded: false, totalScore: currentTotal };
  }

  const newTotal = currentTotal + POINTS_PER_SESSION;
  const now = Date.now();

  // Read-then-write (not a server increment): the rules permit a client
  // totalScore update on the Couple doc, and the single-writer finish
  // interface plus the status guard above keep the award idempotent, so no
  // server-side counter is needed. Client `users/{uid}` points writes are
  // forbidden by the rules and are never attempted here — only
  // Couple.totalScore is written.
  await batchWrite([
    {
      type: 'update',
      ref: doc(db, 'couples', coupleId, 'sessions', sessionId),
      data: { status: 'finished', updatedAt: now },
    },
    {
      type: 'update',
      ref: doc(db, 'couples', coupleId),
      data: { totalScore: newTotal, updatedAt: now },
    },
  ]);

  // Best-effort: achievements follow the same idempotency pattern as the
  // achievements module (existing ids are skipped), so a failure here must
  // never fail the finish itself.
  try {
    await checkAndAwardAchievements(currentUid, { sessionsFinished: 1 });
  } catch {
    // Best-effort: ignore achievement errors.
  }

  return { awarded: true, totalScore: newTotal };
}
