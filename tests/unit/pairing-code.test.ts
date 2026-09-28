import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

// Regression test for: "Displayed code != stored code" (CONTEXT.md divergence #2).
// Bug: Dashboard displayed `user.uid.substring(0,8).toUpperCase()` (8 chars)
// while `createPairingCode()` stored a random 6-char doc id. Typing the
// on-screen code could never match via `getPairingCode()`.
// Fix contract: myCode must come from the awaited `createPairingCode()` return,
// in all modes (no `isDemo` skip), and the input maxLength must match (6).

vi.mock('@/lib/firestore', () => {
  const store = new Map<string, any>();
  return {
    store,
    doc: vi.fn((_db: any, ...segs: string[]) => ({
      id: segs[segs.length - 1],
      path: segs.join('/'),
    })),
    setDoc: vi.fn(async (ref: any, data: any) => {
      store.set(ref.path, data);
    }),
    getDoc: vi.fn(async (ref: any) => {
      const data = store.get(ref.path);
      return { exists: () => data !== undefined, data: () => data };
    }),
    deleteDoc: vi.fn(async (ref: any) => {
      store.delete(ref.path);
    }),
    writeBatch: vi.fn(() => ({ set: vi.fn(), update: vi.fn(), delete: vi.fn(), commit: vi.fn() })),
    getFirestore: vi.fn(),
  };
});

vi.mock('@/lib/firebase/client', () => ({ db: {} }));

import { createPairingCode, getPairingCode } from '@/lib/shared/firestore-helpers';

const ALLOWED = new Set('ABCDEFGHJKLMNPQRSTUVWXYZ23456789'.split(''));

describe('pairing-code (regression)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createPairingCode returns a 6-char code that getPairingCode redeems', async () => {
    const code = await createPairingCode('user-123');
    expect(code).toHaveLength(6);
    for (const ch of code) expect(ALLOWED.has(ch)).toBe(true);
    const fetched = await getPairingCode(code);
    expect(fetched?.userId).toBe('user-123');
  });

  it('Dashboard displays the stored code (not a uid substring), in all modes', () => {
    const src = fs.readFileSync(
      path.join(process.cwd(), 'components/features/couple/Dashboard.tsx'),
      'utf8'
    );
    // The displayed myCode must be assigned from createPairingCode's result.
    expect(src).toMatch(/setMyCode\s*\(\s*code\s*\)/);
    expect(src).toMatch(/createPairingCode\s*\(\s*user\.uid\s*\)/);
    // Must NOT derive the display from the uid, and must NOT skip creation in demo.
    expect(src).not.toMatch(/user\.uid\.substring\(0,\s*8\)/);
    expect(src).not.toMatch(/if\s*\(\s*!isDemo\s*\)/);
    // Input length must accept exactly the 6-char codes.
    expect(src).toMatch(/maxLength=\{6\}/);
  });
});
