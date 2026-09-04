import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getUserProfile, batchWrite } from '@/lib/firestore-helpers';

vi.mock('firebase/firestore', () => ({
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  doc: vi.fn(),
  writeBatch: vi.fn(() => ({
    set: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    commit: vi.fn(),
  })),
  getFirestore: vi.fn(),
}));

vi.mock('@/lib/firebase', () => ({ db: {} }));

import { getDoc, writeBatch } from 'firebase/firestore';

describe('firestore-helpers (Unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getUserProfile returns null if user document does not exist', async () => {
    vi.mocked(getDoc).mockResolvedValueOnce({ exists: () => false } as any);
    const profile = await getUserProfile('u1');
    expect(profile).toBeNull();
  });

  it('getUserProfile returns fully formatted snapshot data', async () => {
    vi.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ email: 'test@example.com', points: 10, streak: 3 })
    } as any);
    const profile = await getUserProfile('u1');
    expect(profile?.email).toBe('test@example.com');
    expect(profile?.points).toBe(10);
    expect(profile?.streak).toBe(3);
  });

  it('batchWrite safely executes mixed CRUD multiple operations sequentially', async () => {
    const mockBatch = {
      set: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      commit: vi.fn(),
    };
    vi.mocked(writeBatch).mockReturnValue(mockBatch as any);

    await batchWrite([
      { type: 'set', ref: {} as any, data: { a: 1 } },
      { type: 'update', ref: {} as any, data: { b: 2 } },
      { type: 'delete', ref: {} as any }
    ]);

    expect(mockBatch.set).toHaveBeenCalledTimes(1);
    expect(mockBatch.update).toHaveBeenCalledTimes(1);
    expect(mockBatch.delete).toHaveBeenCalledTimes(1);
    expect(mockBatch.commit).toHaveBeenCalledTimes(1);
  });
});