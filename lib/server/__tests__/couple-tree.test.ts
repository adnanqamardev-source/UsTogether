import { describe, it, expect, vi } from 'vitest';
import {
  COUPLE_SUBCOLLECTIONS,
  coupleSubcollectionPaths,
  deleteCoupleTree,
  listCoupleIds,
} from '@/lib/server/couple-tree';

function mockAdminDb(subDocs: Record<string, string[]> = {}, coupleIds: string[] = ['c1']) {
  const commits: number[] = [];
  return {
    commits,
    collection: vi.fn((path: string) => {
      if (path === 'couples' && !subDocs.__couple__) {
        return {
          get: async () => ({ docs: coupleIds.map((id) => ({ id })) }),
          doc: (coupleId: string) => ({
            collection: (sub: string) => ({
              get: async () => {
                const ids = subDocs[`${coupleId}/${sub}`] ?? [];
                return {
                  size: ids.length,
                  docs: ids.map((id) => ({ id, ref: { path: `couples/${coupleId}/${sub}/${id}` } })),
                };
              },
            }),
          }),
        };
      }
      return { get: async () => ({ docs: [] }) };
    }),
    batch: () => ({
      delete: vi.fn(),
      commit: async () => {
        commits.push(1);
      },
    }),
  };
}

describe('couple-tree', () => {
  it('covers every couple-owned subcollection and never top-level memory_photos', () => {
    expect([...COUPLE_SUBCOLLECTIONS].sort()).toEqual(
      ['messages', 'memory_photos', 'milestones', 'sessions', 'typing'].sort()
    );
    const paths = coupleSubcollectionPaths('c1');
    expect(paths).toHaveLength(5);
    expect(paths.every((p) => p.startsWith('couples/c1/'))).toBe(true);
    expect(paths).not.toContain('memory_photos');
  });

  it('listCoupleIds returns couple doc ids', async () => {
    const adminDb = mockAdminDb({}, ['a_b', 'c_d']);
    await expect(listCoupleIds(adminDb as any)).resolves.toEqual(['a_b', 'c_d']);
  });

  it('deleteCoupleTree deletes each subcollection and reports counts', async () => {
    const adminDb = mockAdminDb({
      'c1/messages': ['m1', 'm2'],
      'c1/sessions': ['s1'],
      'c1/memory_photos': [],
      'c1/milestones': ['mi1'],
      'c1/typing': ['u1'],
    });
    const counts = await deleteCoupleTree(adminDb as any, 'c1');
    expect(counts).toEqual({
      messages: 2,
      sessions: 1,
      memory_photos: 0,
      milestones: 1,
      typing: 1,
    });
    // One batch commit per non-empty subcollection.
    expect(adminDb.commits.length).toBe(4);
  });

  it('deleteCoupleTree on an empty couple commits nothing', async () => {
    const adminDb = mockAdminDb({});
    const counts = await deleteCoupleTree(adminDb as any, 'empty');
    expect(Object.values(counts).every((n) => n === 0)).toBe(true);
    expect(adminDb.commits.length).toBe(0);
  });
});
