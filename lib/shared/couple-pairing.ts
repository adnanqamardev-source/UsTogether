import { doc, getDoc } from '@/lib/firestore';
import { db } from '@/lib/firebase/client';
import { batchWrite, deletePairingCode, getPairingCode } from './firestore-helpers';

// Couple pairing module: one deep module owning Pairing, Disconnect, and
// Membership behind a small interface.
//
// The interface is the test surface: callers learn the signatures plus the
// invariants and error modes below, and nothing about how the reads and
// writes are composed. The composition (canonical id derivation, the 4-write
// pairing shape, the 3-write disconnect shape) hides inside the module, which
// is where the depth lives: much leverage for callers, one place to change.
// That locality is the point — Pairing and Disconnect previously lived as
// duplicated inline writes in two separate views, so a rule change had to be
// made twice. Now it is made here once.
//
// The Firestore layout is the seam this module hides: callers never build
// document paths or dotted-field payloads themselves. There is a single
// Firestore-backed implementation today; a second in-memory implementation
// for tests would make the seam real instead of hypothetical.

export type PairingErrorCode =
  | 'self'
  | 'invalid-code'
  | 'already-paired'
  | 'not-member'
  | 'permission';

export class PairingError extends Error {
  readonly code: PairingErrorCode;

  constructor(code: PairingErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'PairingError';
    this.code = code;
  }
}

// Invariant: the canonical coupleId is the two uids, sorted,
// underscore-joined. The rules parse membership out of the id string itself,
// so a non-canonical id locks the Couple out of their own data.
// Never hand-build one. Always derive it through this module.
export function deriveCoupleId(uidA: string, uidB: string): string {
  if (!uidA || !uidB) {
    throw new PairingError('invalid-code', 'deriveCoupleId requires two non-empty uids.');
  }
  if (uidA === uidB) {
    throw new PairingError('self', "You can't pair with yourself!");
  }
  return [uidA, uidB].sort().join('_');
}

export interface CoupleMembership {
  user1Id: string;
  user2Id: string;
}

// Membership answers "is this uid one of the two Users on this Couple?"
// from the stored fields, consistent with the id-string parse in the rules.
export function isMember(
  couple: CoupleMembership | null | undefined,
  uid: string | undefined | null
): boolean {
  if (!couple || !uid) return false;
  return couple.user1Id === uid || couple.user2Id === uid;
}

// Returns the id of the other member. Throws PairingError('not-member')
// when uid is neither member, so callers cannot silently resolve a wrong id.
export function partnerIdOf(couple: CoupleMembership, uid: string): string {
  if (uid === couple.user1Id) return couple.user2Id;
  if (uid === couple.user2Id) return couple.user1Id;
  throw new PairingError('not-member', 'User is not a member of this Couple.');
}

function toPairingError(error: unknown, fallback: string): never {
  const code = (error as { code?: string })?.code;
  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : fallback;
  if (code === 'permission-denied' || message.includes('Missing or insufficient permissions')) {
    throw new PairingError('permission', message, { cause: error });
  }
  if (error instanceof PairingError) throw error;
  throw error;
}

// Pairing redeems a single-use code: create the Couple doc, point both
// profiles at it, delete the code. Four writes, one unit from the caller's
// point of view. ownCode is the caller's own displayed code, used only for
// the self-pair guard; membership against the stored code owner is checked
// regardless.
export async function pairWithCode(
  currentUid: string,
  rawCode: string,
  ownCode?: string
): Promise<{ coupleId: string }> {
  const code = (rawCode ?? '').trim().toUpperCase();
  if (!code) {
    throw new PairingError('invalid-code', 'Invalid or expired pairing code.');
  }
  const own = (ownCode ?? '').trim().toUpperCase();
  if (own && code === own) {
    throw new PairingError('self', "You can't pair with yourself!");
  }

  try {
    const codeDoc = await getPairingCode(code);
    if (!codeDoc) {
      throw new PairingError('invalid-code', 'Invalid or expired pairing code.');
    }
    const partnerId = codeDoc.userId;
    if (!partnerId) {
      throw new PairingError('invalid-code', 'Invalid or expired pairing code.');
    }
    if (partnerId === currentUid) {
      throw new PairingError('self', "You can't pair with yourself!");
    }

    const coupleId = deriveCoupleId(currentUid, partnerId);
    const [user1Id, user2Id] = [currentUid, partnerId].sort();
    const now = Date.now();

    // Idempotency: the Couple doc may already exist when the caller retries
    // from a stale pairing view (e.g. success on one device, retry from the
    // other before its profile subscription catches up) or when both members
    // redeem concurrently. Re-setting the full doc would be evaluated as an
    // *update* by the rules and denied (user1Id/user2Id/createdAt are
    // immutable), surfacing a permission-denied for a pairing that already
    // holds. When the caller is already a member, the outcome holds —
    // best-effort consume the single-use code and report success so the
    // caller transitions instead of erroring.
    const coupleSnap = await getDoc(doc(db, 'couples', coupleId));
    const existingCouple = coupleSnap.exists()
      ? (coupleSnap.data() as CoupleMembership)
      : null;
    if (existingCouple && isMember(existingCouple, currentUid)) {
      await deletePairingCode(code);
      return { coupleId };
    }

    await batchWrite([
      {
        type: 'set',
        ref: doc(db, 'couples', coupleId),
        data: {
          user1Id,
          user2Id,
          status: 'active',
          totalScore: 0,
          createdAt: now,
          updatedAt: now,
        },
      },
      {
        type: 'update',
        ref: doc(db, 'users', currentUid),
        data: { pairedCoupleId: coupleId, updatedAt: now },
      },
      {
        type: 'update',
        ref: doc(db, 'users', partnerId),
        data: { pairedCoupleId: coupleId, updatedAt: now },
      },
      { type: 'delete', ref: doc(db, 'pairingCodes', code) },
    ]);

    return { coupleId };
  } catch (error) {
    toPairingError(error, 'Error occurred');
  }
}

// Disconnect reverses Pairing: clear both pairedCoupleId fields, delete the
// Couple doc. Three writes. Callers own the surrounding UI (confirm, alert,
// reload); this module never touches the window.
export async function disconnectCouple(
  coupleId: string,
  currentUid: string
): Promise<{ partnerId: string }> {
  try {
    const snap = await getDoc(doc(db, 'couples', coupleId));
    const couple = snap.exists() ? (snap.data() as CoupleMembership) : null;
    if (!isMember(couple, currentUid)) {
      throw new PairingError('not-member', 'User is not a member of this Couple.');
    }
    const partnerId = partnerIdOf(couple as CoupleMembership, currentUid);
    const now = Date.now();

    await batchWrite([
      {
        type: 'update',
        ref: doc(db, 'users', currentUid),
        data: { pairedCoupleId: '', updatedAt: now },
      },
      {
        type: 'update',
        ref: doc(db, 'users', partnerId),
        data: { pairedCoupleId: '', updatedAt: now },
      },
      { type: 'delete', ref: doc(db, 'couples', coupleId) },
    ]);

    return { partnerId };
  } catch (error) {
    toPairingError(error, 'Failed to disconnect. Please try again.');
  }
}
