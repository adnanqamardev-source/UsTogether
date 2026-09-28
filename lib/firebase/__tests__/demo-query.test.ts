import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  demoDb,
  __resetDemoStore,
} from '../demo';

const SESSIONS = 'couples/demo-couple-1/sessions';
const MESSAGES = 'couples/demo-couple-1/messages';

beforeEach(() => {
  __resetDemoStore();
});

describe('demo adapter query constraints', () => {
  it("where('status','==','finished') filters sessions", async () => {
    const snap = await getDocs(
      query(collection(demoDb, SESSIONS), where('status', '==', 'finished'))
    );
    expect(snap.size).toBe(3);
    expect(snap.docs.every((d) => d.data().status === 'finished')).toBe(true);
  });

  it("where('status','==','waiting') returns the single waiting session", async () => {
    const snap = await getDocs(
      query(collection(demoDb, SESSIONS), where('status', '==', 'waiting'))
    );
    expect(snap.size).toBe(1);
    expect(snap.docs[0].id).toBe('s4');
  });

  it("where() with 'in' filters", async () => {
    const snap = await getDocs(
      query(collection(demoDb, SESSIONS), where('status', 'in', ['waiting']))
    );
    expect(snap.size).toBe(1);
    expect(snap.docs[0].id).toBe('s4');
  });

  it("where() with '!=' and comparison ops filters", async () => {
    const notFinished = await getDocs(
      query(collection(demoDb, SESSIONS), where('status', '!=', 'finished'))
    );
    expect(notFinished.size).toBe(1);

    const recent = await getDocs(
      query(
        collection(demoDb, SESSIONS),
        where('createdAt', '>', Date.now() - 2 * 24 * 60 * 60 * 1000)
      )
    );
    expect(recent.size).toBe(1);
    expect(recent.docs[0].id).toBe('s4');
  });

  it("where() with 'array-contains' filters", async () => {
    const snap = await getDocs(
      query(
        collection(demoDb, MESSAGES),
        where('readBy', 'array-contains', 'demo-user-1')
      )
    );
    // msg1 is only read by demo-user-2; msg2-msg4 include demo-user-1.
    expect(snap.size).toBe(3);
  });

  it('orderBy + limit apply', async () => {
    const asc = await getDocs(
      query(
        collection(demoDb, SESSIONS),
        orderBy('createdAt', 'asc'),
        limit(2)
      )
    );
    expect(asc.docs.map((d) => d.id)).toEqual(['s3', 's2']);

    const desc = await getDocs(
      query(
        collection(demoDb, SESSIONS),
        orderBy('createdAt', 'desc'),
        limit(1)
      )
    );
    expect(desc.docs.map((d) => d.id)).toEqual(['s4']);
  });

  it('onSnapshot applies where() constraints too', async () => {
    const seen: string[][] = [];
    const unsub = onSnapshot(
      query(collection(demoDb, SESSIONS), where('status', '==', 'finished')),
      (snap: any) => {
        seen.push(snap.docs.map((d: any) => d.id));
      }
    );
    unsub();
    expect(seen.length).toBeGreaterThan(0);
    expect(seen[0].sort()).toEqual(['s1', 's2', 's3']);
  });

  it('where() stores both op and opStr so matches() can read either', () => {
    const c = where('status', '==', 'finished') as any;
    expect(c.__demoWhere).toBe(true);
    expect(c.op).toBe('==');
    expect(c.opStr).toBe('==');
  });
});

describe('single adapter seam (static checks)', () => {
  const root = process.cwd();
  const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');

  it('lib/firestore.ts has exactly one adapter-selection branch and no any-typed ternaries', () => {
    const src = read('lib/firestore.ts');
    expect((src.match(/isDemo\s*\?/g) || []).length).toBe(1);
    expect(src).not.toMatch(/\.\.\.args:\s*any\[\]/);
  });

  it('useFirestoreCollection has no hook-level demo bypass', () => {
    const src = read('hooks/useFirestoreCollection.ts');
    expect(src).not.toContain('demo-seed');
    expect(src).not.toMatch(/includes\(\s*['"]sessions['"]\s*\)/);
    expect(src).not.toMatch(/includes\(\s*['"]quizzes['"]\s*\)/);
    expect(src).not.toMatch(/includes\(\s*['"]messages['"]\s*\)/);
    expect(src).not.toMatch(/includes\(\s*['"]achievements['"]\s*\)/);
    // Still guards against not-ready paths and flows through the adapter.
    expect(src).toContain('normalizePath');
    expect(src).toContain('onSnapshot');
  });

  it('useFirestoreDocument already passes through the adapter (no bypass)', () => {
    const src = read('hooks/useFirestoreDocument.ts');
    expect(src).not.toContain('demo-seed');
    expect(src).not.toContain('isDemo');
    expect(src).toContain('onSnapshot');
  });
});
