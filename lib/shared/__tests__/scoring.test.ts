import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/firestore', () => ({
  doc: vi.fn((_db: unknown, ...segs: string[]) => ({ path: segs.join('/') })),
  getDoc: vi.fn(),
}));

vi.mock('@/lib/firebase/client', () => ({ db: {} }));

vi.mock('@/lib/shared/firestore-helpers', () => ({
  batchWrite: vi.fn(),
}));

vi.mock('@/lib/shared/achievements', () => ({
  checkAndAwardAchievements: vi.fn(),
}));

import { getDoc } from '@/lib/firestore';
import { batchWrite } from '@/lib/shared/firestore-helpers';
import { checkAndAwardAchievements } from '@/lib/shared/achievements';
import {
  finishSessionWithScore,
  POINTS_PER_SESSION,
} from '@/lib/shared/scoring';
import { PairingError } from '@/lib/shared/couple-pairing';

const COUPLE_ID = 'u1_u2';
const SESSION_ID = 's1';

function snap(data: Record<string, unknown> | null) {
  return {
    exists: () => data !== null,
    data: () => data,
  } as never;
}

function mockCoupleAndSession(
  couple: Record<string, unknown> | null,
  session: Record<string, unknown> | null
) {
  vi.mocked(getDoc).mockImplementation(async (ref: unknown) => {
    const path = (ref as { path: string }).path;
    if (path === `couples/${COUPLE_ID}/sessions/${SESSION_ID}`) {
      return snap(session);
    }
    return snap(couple);
  });
}

const coupleDoc = (totalScore: number) => ({
  user1Id: 'u1',
  user2Id: 'u2',
  status: 'active',
  totalScore,
  createdAt: 1,
  updatedAt: 1,
});

const sessionDoc = (status: string) => ({
  coupleId: COUPLE_ID,
  type: 'quiz',
  status,
  state: {},
  createdAt: 1,
  updatedAt: 1,
});

describe('scoring (Unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('already-finished session performs no write', async () => {
    mockCoupleAndSession(coupleDoc(10), sessionDoc('finished'));

    const result = await finishSessionWithScore(COUPLE_ID, SESSION_ID, 'u1');

    expect(result).toEqual({ awarded: false, totalScore: 10 });
    expect(batchWrite).not.toHaveBeenCalled();
    expect(checkAndAwardAchievements).not.toHaveBeenCalled();
  });

  it('fresh finish writes the finish shape once', async () => {
    mockCoupleAndSession(coupleDoc(5), sessionDoc('playing'));
    vi.mocked(batchWrite).mockResolvedValue(undefined);
    vi.mocked(checkAndAwardAchievements).mockResolvedValue([]);

    const result = await finishSessionWithScore(COUPLE_ID, SESSION_ID, 'u1');

    expect(result).toEqual({ awarded: true, totalScore: 5 + POINTS_PER_SESSION });
    expect(batchWrite).toHaveBeenCalledTimes(1);
    const writes = vi.mocked(batchWrite).mock.calls[0][0];
    expect(writes.map((w) => w.type)).toEqual(['update', 'update']);
    expect(writes.map((w) => (w.ref as unknown as { path: string }).path)).toEqual([
      `couples/${COUPLE_ID}/sessions/${SESSION_ID}`,
      `couples/${COUPLE_ID}`,
    ]);
    expect(writes[0].data).toMatchObject({ status: 'finished' });
    expect(writes[1].data).toMatchObject({ totalScore: 5 + POINTS_PER_SESSION });
    expect(checkAndAwardAchievements).toHaveBeenCalledWith('u1', { sessionsFinished: 1 });
  });

  it('double finish awards only once', async () => {
    vi.mocked(batchWrite).mockResolvedValue(undefined);
    vi.mocked(checkAndAwardAchievements).mockResolvedValue([]);

    mockCoupleAndSession(coupleDoc(0), sessionDoc('playing'));
    const first = await finishSessionWithScore(COUPLE_ID, SESSION_ID, 'u1');
    expect(first).toEqual({ awarded: true, totalScore: POINTS_PER_SESSION });

    // Second call reads the now-finished session: no further write.
    mockCoupleAndSession(coupleDoc(POINTS_PER_SESSION), sessionDoc('finished'));
    const second = await finishSessionWithScore(COUPLE_ID, SESSION_ID, 'u1');
    expect(second).toEqual({ awarded: false, totalScore: POINTS_PER_SESSION });

    expect(batchWrite).toHaveBeenCalledTimes(1);
    expect(checkAndAwardAchievements).toHaveBeenCalledTimes(1);
  });

  it('throws not-member for outsiders without writing', async () => {
    mockCoupleAndSession(coupleDoc(0), sessionDoc('playing'));

    await expect(finishSessionWithScore(COUPLE_ID, SESSION_ID, 'u3')).rejects.toMatchObject({
      name: 'PairingError',
    });
    try {
      await finishSessionWithScore(COUPLE_ID, SESSION_ID, 'u3');
      throw new Error('expected PairingError');
    } catch (err) {
      expect(err).toBeInstanceOf(PairingError);
      expect((err as PairingError).code).toBe('not-member');
    }
    expect(batchWrite).not.toHaveBeenCalled();
  });
});
