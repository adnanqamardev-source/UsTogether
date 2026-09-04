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
  writeBatch: vi.fn(() => ({
    set: vi.fn(),
    commit: vi.fn(),
  })),
  serverTimestamp: vi.fn(() => ({ _methodName: 'serverTimestamp' })),
  getFirestore: vi.fn(),
}));

// Mock db without triggering real Firebase init
vi.mock('@/lib/firebase', () => ({ db: {}, auth: {} }));

import { getDoc, getDocs, setDoc, writeBatch, collection, query, doc } from 'firebase/firestore';

const mockGetDoc = vi.mocked(getDoc);
const mockGetDocs = vi.mocked(getDocs);
const mockSetDoc = vi.mocked(setDoc);
const mockWriteBatch = vi.mocked(writeBatch);

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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Awards multiple achievements at once if criteria are met', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        streak: 7,
        quizzesCompleted: 1,
        sessionsFinished: 1,
        paired: true,
      }),
    } as any);

    mockGetDocs.mockResolvedValueOnce({
      docs: [],
    } as any);

    const mockBatch = { set: vi.fn(), commit: vi.fn() };
    mockWriteBatch.mockReturnValueOnce(mockBatch as any);

    const awarded = await checkAndAwardAchievements(userId, {
      currentStreak: 7,
      quizzesCompleted: 1,
      sessionsFinished: 1,
      paired: true,
    });

    expect(awarded.sort()).toEqual(['first_quiz', 'first_session', 'partner_paired', 'streak_3', 'streak_7'].sort());
    expect(mockSetDoc).toHaveBeenCalledTimes(5);
  });

  it('Does NOT award achievements the user already owns', async () => {
    const existingDocs = [
      { id: 'first_quiz', data: () => ({}) },
      { id: 'streak_3', data: () => ({}) },
    ];

    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        streak: 7,
        quizzesCompleted: 1,
        sessionsFinished: 1,
        paired: true,
      }),
    } as any);

    mockGetDocs.mockResolvedValueOnce({
      docs: existingDocs,
    } as any);

    const mockBatch = { set: vi.fn(), commit: vi.fn() };
    mockWriteBatch.mockReturnValueOnce(mockBatch as any);

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

  it('Returns empty array when user stats doc does not exist', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => false,
    } as any);
    
    mockGetDocs.mockResolvedValueOnce({
      docs: [],
    } as any);

    const awarded = await checkAndAwardAchievements(userId, {
      currentStreak: 0,
      quizzesCompleted: 0,
      sessionsFinished: 0,
      paired: false,
    });

    expect(awarded).toEqual([]);
  });

  it('Awards first_quiz when quizzesCompleted >= 1', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        streak: 0,
        quizzesCompleted: 1,
        sessionsFinished: 0,
        paired: false,
      }),
    } as any);

    mockGetDocs.mockResolvedValueOnce({
      docs: [],
    } as any);

    const mockBatch = { set: vi.fn(), commit: vi.fn() };
    mockWriteBatch.mockReturnValueOnce(mockBatch as any);

    const awarded = await checkAndAwardAchievements(userId, {
      currentStreak: 0,
      quizzesCompleted: 1,
      sessionsFinished: 0,
      paired: false,
    });

    expect(awarded).toEqual(['first_quiz']);
  });

  it('Awards first_session when sessionsFinished >= 1', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        streak: 0,
        quizzesCompleted: 0,
        sessionsFinished: 1,
        paired: false,
      }),
    } as any);

    mockGetDocs.mockResolvedValueOnce({
      docs: [],
    } as any);

    const mockBatch = { set: vi.fn(), commit: vi.fn() };
    mockWriteBatch.mockReturnValueOnce(mockBatch as any);

    const awarded = await checkAndAwardAchievements(userId, {
      currentStreak: 0,
      quizzesCompleted: 0,
      sessionsFinished: 1,
      paired: false,
    });

    expect(awarded).toEqual(['first_session']);
  });

  it('Does not award when thresholds are not met', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        streak: 2,
        quizzesCompleted: 0,
        sessionsFinished: 0,
        paired: false,
      }),
    } as any);

    mockGetDocs.mockResolvedValueOnce({
      docs: [],
    } as any);

    const awarded = await checkAndAwardAchievements(userId, {
      currentStreak: 2,
      quizzesCompleted: 0,
      sessionsFinished: 0,
      paired: false,
    });

    expect(awarded).toHaveLength(0);
  });

  it('Awards partner_paired when paired is true', async () => {
    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        streak: 0,
        quizzesCompleted: 0,
        sessionsFinished: 0,
        paired: true,
      }),
    } as any);

    mockGetDocs.mockResolvedValueOnce({
      docs: [],
    } as any);

    const mockBatch = { set: vi.fn(), commit: vi.fn() };
    mockWriteBatch.mockReturnValueOnce(mockBatch as any);

    const awarded = await checkAndAwardAchievements(userId, {
      currentStreak: 0,
      quizzesCompleted: 0,
      sessionsFinished: 0,
      paired: true,
    });

    expect(awarded).toEqual(['partner_paired']);
  });
});