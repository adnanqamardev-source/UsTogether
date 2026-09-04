import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkAndAwardAchievements, getEligibleAchievements } from '@/lib/achievements';

class MockQuery {
  where = vi.fn(function (this: MockQuery) { return this; });
}

vi.mock('firebase/firestore', () => ({
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  setDoc: vi.fn(),
  doc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(() => new MockQuery()),
  where: vi.fn(),
  runTransaction: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _methodName: 'serverTimestamp' })),
  getFirestore: vi.fn(),
}));

// Mock db without triggering real Firebase init
vi.mock('@/lib/firebase', () => ({ db: {}, auth: {} }));

// Mock the underlying client module so the real Firebase client.ts is never
// evaluated in the jsdom test environment (which would trigger getAuth/getStorage
// with an invalid api key and throw auth/invalid-api-key at import time).
vi.mock('@/lib/firebase/client', () => ({ db: {}, auth: {} }));

import { getDoc, getDocs, setDoc, runTransaction, collection, query, doc } from 'firebase/firestore';

const mockGetDoc = vi.mocked(getDoc);
const mockGetDocs = vi.mocked(getDocs);
const mockSetDoc = vi.mocked(setDoc);
const mockRunTransaction = vi.mocked(runTransaction);

describe('getEligibleAchievements()', () => {
  const userId = 'user_123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Returns achievements that meet conditions and are not already owned', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [],
    } as any);

    const eligible = await getEligibleAchievements(userId, {
      currentStreak: 7,
      quizzesCompleted: 1,
      sessionsFinished: 1,
      paired: true,
    });

    expect(eligible).toHaveLength(5);
    expect(eligible.map(a => a.id).sort()).toEqual(
      ['first_quiz', 'first_session', 'partner_paired', 'streak_3', 'streak_7'].sort()
    );
  });

  it('Returns empty array when all eligible achievements are already owned', async () => {
    const ownedIds = ['first_quiz', 'streak_3', 'streak_7', 'first_session', 'partner_paired'];
    mockGetDocs.mockResolvedValueOnce({
      docs: ownedIds.map(id => ({ id, data: () => ({}) })),
    } as any);

    const eligible = await getEligibleAchievements(userId, {
      currentStreak: 7,
      quizzesCompleted: 1,
      sessionsFinished: 1,
      paired: true,
    });

    expect(eligible).toHaveLength(0);
  });

  it('Handles missing subcollection gracefully (empty docs)', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [],
    } as any);

    const eligible = await getEligibleAchievements(userId, {
      currentStreak: 7,
      quizzesCompleted: 1,
      sessionsFinished: 1,
      paired: true,
    });

    expect(eligible).toHaveLength(5);
  });
});

describe('checkAndAwardAchievements()', () => {
  const userId = 'user_123';

  // The live implementation wraps everything in runTransaction, which reads
  // existing achievements via getDocs and writes via transaction.set.
  function mockTransaction(ownedIds: string[] = []) {
    const tx = { set: vi.fn() };
    mockGetDocs.mockResolvedValueOnce({
      docs: ownedIds.map(id => ({ id, data: () => ({}) })),
    } as any);
    mockRunTransaction.mockImplementationOnce(async (db, fn: any) =>
      fn(tx)
    );
    return tx;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Awards multiple achievements at once if criteria are met', async () => {
    const tx = mockTransaction([]);

    const awarded = await checkAndAwardAchievements(userId, {
      currentStreak: 7,
      quizzesCompleted: 1,
      sessionsFinished: 1,
      paired: true,
    });

    expect(awarded.sort()).toEqual(['first_quiz', 'first_session', 'partner_paired', 'streak_3', 'streak_7'].sort());
    expect(tx.set).toHaveBeenCalledTimes(5);
  });

  it('Does NOT award achievements the user already owns', async () => {
    mockTransaction(['first_quiz', 'streak_3']);

    const awarded = await checkAndAwardAchievements(userId, {
      currentStreak: 7,
      quizzesCompleted: 1,
      sessionsFinished: 1,
      paired: true,
    });

    expect(awarded).not.toContain('first_quiz');
    expect(awarded).not.toContain('streak_3');
    expect(awarded).toContain('streak_7');
    expect(awarded).toContain('partner_paired');
  });

  it('Returns empty array when no achievements are eligible', async () => {
    const tx = mockTransaction([]);

    const awarded = await checkAndAwardAchievements(userId, {
      currentStreak: 0,
      quizzesCompleted: 0,
      sessionsFinished: 0,
      paired: false,
    });

    expect(awarded).toEqual([]);
    expect(tx.set).not.toHaveBeenCalled();
  });

  it('Awards first_quiz when quizzesCompleted >= 1', async () => {
    const tx = mockTransaction([]);

    const awarded = await checkAndAwardAchievements(userId, {
      currentStreak: 0,
      quizzesCompleted: 1,
      sessionsFinished: 0,
      paired: false,
    });

    expect(awarded).toEqual(['first_quiz']);
    expect(tx.set).toHaveBeenCalledTimes(1);
  });

  it('Awards first_session when sessionsFinished >= 1', async () => {
    const tx = mockTransaction([]);

    const awarded = await checkAndAwardAchievements(userId, {
      currentStreak: 0,
      quizzesCompleted: 0,
      sessionsFinished: 1,
      paired: false,
    });

    expect(awarded).toEqual(['first_session']);
    expect(tx.set).toHaveBeenCalledTimes(1);
  });

  it('Does not award when thresholds are not met', async () => {
    const tx = mockTransaction([]);

    const awarded = await checkAndAwardAchievements(userId, {
      currentStreak: 2,
      quizzesCompleted: 0,
      sessionsFinished: 0,
      paired: false,
    });

    expect(awarded).toHaveLength(0);
    expect(tx.set).not.toHaveBeenCalled();
  });

  it('Awards partner_paired when paired is true', async () => {
    const tx = mockTransaction([]);

    const awarded = await checkAndAwardAchievements(userId, {
      currentStreak: 0,
      quizzesCompleted: 0,
      sessionsFinished: 0,
      paired: true,
    });

    expect(awarded).toEqual(['partner_paired']);
    expect(tx.set).toHaveBeenCalledTimes(1);
  });
});