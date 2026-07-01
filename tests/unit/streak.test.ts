import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { updateStreak } from '@/lib/streak';

// Mock Firebase Firestore and db before imports
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual<typeof import('firebase/firestore')>('firebase/firestore');
  return {
    ...actual,
    getDoc: vi.fn(),
    setDoc: vi.fn(),
    doc: vi.fn(),
    serverTimestamp: vi.fn(() => ({ _methodName: 'serverTimestamp' })),
  };
});

vi.mock('@/lib/firebase', async () => {
  const actual = await vi.importActual<typeof import('@/lib/firebase')>('@/lib/firebase');
  return {
    ...actual,
    db: {},
  };
});

import { getDoc, setDoc, doc } from 'firebase/firestore';

const mockGetDoc = vi.mocked(getDoc);
const mockSetDoc = vi.mocked(setDoc);
const mockDoc = vi.mocked(doc);

describe('updateStreak()', () => {
  const userId = 'user_123';

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('First time user (no lastActiveDate) -> Starts streak at 1', async () => {
    vi.setSystemTime(new Date('2024-02-15T12:00:00Z'));
    const userRef = doc({} as any, 'users', userId);
    mockDoc.mockReturnValue(userRef as any);

    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ streak: 0 }),
    } as any);

    await updateStreak(userId);

    expect(mockSetDoc).toHaveBeenCalledWith(
      userRef,
      expect.objectContaining({
        streak: 1,
        lastActiveDate: '2024-02-15',
      }),
      { merge: true }
    );
  });

  it('Activity on the SAME day -> Streak remains unchanged (no Firestore write)', async () => {
    const today = '2024-02-15';
    vi.setSystemTime(new Date(`${today}T12:00:00Z`));
    const userRef = doc({} as any, 'users', userId);
    mockDoc.mockReturnValue(userRef as any);

    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ streak: 5, lastActiveDate: today }),
    } as any);

    await updateStreak(userId);

    expect(mockSetDoc).not.toHaveBeenCalled();
  });

  it('Activity on CONSECUTIVE day -> Increments streak', async () => {
    const today = new Date('2024-02-15T12:00:00Z');
    const yesterday = '2024-02-14';
    vi.setSystemTime(today);
    const userRef = doc({} as any, 'users', userId);
    mockDoc.mockReturnValue(userRef as any);

    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ streak: 5, lastActiveDate: yesterday }),
    } as any);

    await updateStreak(userId);

    expect(mockSetDoc).toHaveBeenCalledWith(
      userRef,
      expect.objectContaining({
        streak: 6,
        lastActiveDate: '2024-02-15',
      }),
      { merge: true }
    );
  });

  it('Missed 1 day -> Resets streak to 1', async () => {
    const today = new Date('2024-02-15T12:00:00Z');
    const twoDaysAgo = '2024-02-13';
    vi.setSystemTime(today);
    const userRef = doc({} as any, 'users', userId);
    mockDoc.mockReturnValue(userRef as any);

    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ streak: 10, lastActiveDate: twoDaysAgo }),
    } as any);

    await updateStreak(userId);

    expect(mockSetDoc).toHaveBeenCalledWith(
      userRef,
      expect.objectContaining({
        streak: 1,
        lastActiveDate: '2024-02-15',
      }),
      { merge: true }
    );
  });

  it('Month transition (Feb 29 to March 1) -> Increments correctly', async () => {
    const today = new Date('2024-03-01T12:00:00Z');
    vi.setSystemTime(today);
    const userRef = doc({} as any, 'users', userId);
    mockDoc.mockReturnValue(userRef as any);

    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ streak: 14, lastActiveDate: '2024-02-29' }),
    } as any);

    await updateStreak(userId);

    expect(mockSetDoc).toHaveBeenCalledWith(
      userRef,
      expect.objectContaining({
        streak: 15,
        lastActiveDate: '2024-03-01',
      }),
      { merge: true }
    );
  });

  it('Leap year edge case (Feb 28 to Feb 29) -> Increments correctly', async () => {
    const today = new Date('2024-02-29T12:00:00Z');
    vi.setSystemTime(today);
    const userRef = doc({} as any, 'users', userId);
    mockDoc.mockReturnValue(userRef as any);

    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ streak: 3, lastActiveDate: '2024-02-28' }),
    } as any);

    await updateStreak(userId);

    expect(mockSetDoc).toHaveBeenCalledWith(
      userRef,
      expect.objectContaining({
        streak: 4,
        lastActiveDate: '2024-02-29',
      }),
      { merge: true }
    );
  });

  it('Year boundary (Dec 31 to Jan 1) -> Increments correctly', async () => {
    const today = new Date('2025-01-01T12:00:00Z');
    vi.setSystemTime(today);
    const userRef = doc({} as any, 'users', userId);
    mockDoc.mockReturnValue(userRef as any);

    mockGetDoc.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ streak: 7, lastActiveDate: '2024-12-31' }),
    } as any);

    await updateStreak(userId);

    expect(mockSetDoc).toHaveBeenCalledWith(
      userRef,
      expect.objectContaining({
        streak: 8,
        lastActiveDate: '2025-01-01',
      }),
      { merge: true }
    );
  });

  it('User profile does not exist -> Throws error', async () => {
    const userRef = doc({} as any, 'users', userId);
    mockDoc.mockReturnValue(userRef as any);

    mockGetDoc.mockResolvedValueOnce({
      exists: () => false,
    } as any);

    await expect(updateStreak(userId)).rejects.toThrow('User profile not found');
    expect(mockSetDoc).not.toHaveBeenCalled();
  });
});