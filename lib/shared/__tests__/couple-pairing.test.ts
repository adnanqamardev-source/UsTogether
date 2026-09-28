import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/firestore', () => ({
  doc: vi.fn((_db: unknown, ...segs: string[]) => ({ path: segs.join('/') })),
  getDoc: vi.fn(),
}));

vi.mock('@/lib/firebase/client', () => ({ db: {} }));

vi.mock('@/lib/shared/firestore-helpers', () => ({
  getPairingCode: vi.fn(),
  batchWrite: vi.fn(),
  deletePairingCode: vi.fn(),
}));

import { getDoc } from '@/lib/firestore';
import { getPairingCode, batchWrite, deletePairingCode } from '@/lib/shared/firestore-helpers';
import {
  deriveCoupleId,
  isMember,
  partnerIdOf,
  pairWithCode,
  disconnectCouple,
  PairingError,
} from '@/lib/shared/couple-pairing';

function expectPairingCode(promise: Promise<unknown>, code: string) {
  return promise.then(
    () => {
      throw new Error('expected PairingError');
    },
    (err) => {
      expect(err).toBeInstanceOf(PairingError);
      expect((err as PairingError).code).toBe(code);
    }
  );
}

describe('couple-pairing (Unit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('deriveCoupleId', () => {
    it('sorts the two uids so the id is canonical', () => {
      expect(deriveCoupleId('uidB', 'uidA')).toBe('uidA_uidB');
      expect(deriveCoupleId('uidA', 'uidB')).toBe('uidA_uidB');
    });

    it('throws PairingError(self) for the same uid twice', async () => {
      await expectPairingCode(Promise.resolve().then(() => deriveCoupleId('a', 'a')), 'self');
    });

    it('throws on empty args', async () => {
      await expectPairingCode(Promise.resolve().then(() => deriveCoupleId('', 'b')), 'invalid-code');
      await expectPairingCode(Promise.resolve().then(() => deriveCoupleId('a', '' as string)), 'invalid-code');
    });
  });

  describe('isMember / partnerIdOf', () => {
    const couple = { user1Id: 'u1', user2Id: 'u2' };

    it('isMember matches either member only', () => {
      expect(isMember(couple, 'u1')).toBe(true);
      expect(isMember(couple, 'u2')).toBe(true);
      expect(isMember(couple, 'u3')).toBe(false);
      expect(isMember(null, 'u1')).toBe(false);
      expect(isMember(undefined, 'u1')).toBe(false);
      expect(isMember(couple, undefined)).toBe(false);
      expect(isMember(couple, null)).toBe(false);
    });

    it('partnerIdOf returns the other member', () => {
      expect(partnerIdOf(couple, 'u1')).toBe('u2');
      expect(partnerIdOf(couple, 'u2')).toBe('u1');
    });

    it('partnerIdOf throws PairingError(not-member) for outsiders', async () => {
      await expectPairingCode(
        Promise.resolve().then(() => partnerIdOf(couple, 'u3')),
        'not-member'
      );
    });
  });

  describe('pairWithCode', () => {
    beforeEach(() => {
      // Default: no Couple doc yet (first-time pairing).
      vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as never);
    });

    it('throws invalid-code for empty input without reading stored codes', async () => {
      await expectPairingCode(pairWithCode('u1', '   '), 'invalid-code');
      expect(getPairingCode).not.toHaveBeenCalled();
    });

    it('throws invalid-code when the stored code does not exist', async () => {
      vi.mocked(getPairingCode).mockResolvedValue(null);
      await expectPairingCode(pairWithCode('u1', 'nope12'), 'invalid-code');
      expect(getPairingCode).toHaveBeenCalledWith('NOPE12');
    });

    it('throws self when the code matches the caller’s own displayed code', async () => {
      vi.mocked(getPairingCode).mockResolvedValue({ userId: 'u2', createdAt: 1 });
      await expectPairingCode(pairWithCode('u1', ' abc123 ', 'ABC123'), 'self');
      expect(getPairingCode).not.toHaveBeenCalled();
    });

    it('throws self when the stored code belongs to the caller', async () => {
      vi.mocked(getPairingCode).mockResolvedValue({ userId: 'u1', createdAt: 1 });
      await expectPairingCode(pairWithCode('u1', 'ABC123'), 'self');
      expect(batchWrite).not.toHaveBeenCalled();
    });

    it('writes the canonical 4-write shape on success', async () => {
      vi.mocked(getPairingCode).mockResolvedValue({ userId: 'u1', createdAt: 1 });
      vi.mocked(batchWrite).mockResolvedValue(undefined);

      const result = await pairWithCode('u2', ' abc123 ');
      expect(result).toEqual({ coupleId: 'u1_u2' });

      expect(getPairingCode).toHaveBeenCalledWith('ABC123');
      expect(batchWrite).toHaveBeenCalledTimes(1);
      const writes = vi.mocked(batchWrite).mock.calls[0][0];
      expect(writes.map((w) => w.type)).toEqual(['set', 'update', 'update', 'delete']);
      expect(writes.map((w) => (w.ref as unknown as { path: string }).path)).toEqual([
        'couples/u1_u2',
        'users/u2',
        'users/u1',
        'pairingCodes/ABC123',
      ]);
      const setData = writes[0].data as Record<string, unknown>;
      expect(setData.user1Id).toBe('u1');
      expect(setData.user2Id).toBe('u2');
      expect(setData.status).toBe('active');
      expect(setData.totalScore).toBe(0);
    });

    it('returns success without rewriting when the Couple already exists and caller is a member', async () => {
      vi.mocked(getPairingCode).mockResolvedValue({ userId: 'u1', createdAt: 1 });
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ user1Id: 'u1', user2Id: 'u2' }),
      } as never);
      vi.mocked(deletePairingCode).mockResolvedValue(undefined);

      const result = await pairWithCode('u2', 'ABC123');
      expect(result).toEqual({ coupleId: 'u1_u2' });

      // No full-doc re-set (the rules would deny it as an update), but the
      // single-use code is still consumed best-effort.
      expect(batchWrite).not.toHaveBeenCalled();
      expect(deletePairingCode).toHaveBeenCalledWith('ABC123');
    });

    it('proceeds to write when the Couple exists but the caller is not a member', async () => {
      vi.mocked(getPairingCode).mockResolvedValue({ userId: 'u1', createdAt: 1 });
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ user1Id: 'u9', user2Id: 'u8' }),
      } as never);
      vi.mocked(batchWrite).mockResolvedValue(undefined);

      // Couple id derives from (caller, code owner), so this falls through
      // to the normal write path (which the rules will judge).
      await pairWithCode('u2', 'ABC123');
      expect(batchWrite).toHaveBeenCalledTimes(1);
      expect(deletePairingCode).not.toHaveBeenCalled();
    });
  });

  describe('disconnectCouple', () => {
    it('writes the 3-write shape and returns the partner id', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ user1Id: 'u1', user2Id: 'u2' }),
      } as never);
      vi.mocked(batchWrite).mockResolvedValue(undefined);

      const result = await disconnectCouple('u1_u2', 'u1');
      expect(result).toEqual({ partnerId: 'u2' });

      expect(batchWrite).toHaveBeenCalledTimes(1);
      const writes = vi.mocked(batchWrite).mock.calls[0][0];
      expect(writes.map((w) => w.type)).toEqual(['update', 'update', 'delete']);
      expect(writes.map((w) => (w.ref as unknown as { path: string }).path)).toEqual([
        'users/u1',
        'users/u2',
        'couples/u1_u2',
      ]);
      expect(writes[0].data).toMatchObject({ pairedCoupleId: '' });
      expect(writes[1].data).toMatchObject({ pairedCoupleId: '' });
    });

    it('throws not-member for outsiders without writing', async () => {
      vi.mocked(getDoc).mockResolvedValue({
        exists: () => true,
        data: () => ({ user1Id: 'u1', user2Id: 'u2' }),
      } as never);

      await expectPairingCode(disconnectCouple('u1_u2', 'u3'), 'not-member');
      expect(batchWrite).not.toHaveBeenCalled();
    });

    it('throws not-member when the Couple doc is missing', async () => {
      vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as never);

      await expectPairingCode(disconnectCouple('u1_u2', 'u1'), 'not-member');
      expect(batchWrite).not.toHaveBeenCalled();
    });
  });
});
