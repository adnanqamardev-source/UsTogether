// Server-only module: owns couple-subtree deletion so reset leaves no orphans.
//
// codebase-design vocabulary:
// - module: this file is the single home for couple-tree deletion.
// - interface: deleteCoupleTree + listCoupleIds (+ path helpers) are the
//   module's interface; callers depend on the interface, not on internals.
// - seam: COUPLE_SUBCOLLECTIONS is the seam where the set of couple-owned
//   subcollections is declared in one place (mirrors firestore.rules
//   couples/{coupleId} matches and MemoryBoard path construction).
// - adapter: the route file adapts this module to the reset-data HTTP flow.

const BATCH_SIZE = 500;

// Seam: every couple-owned subcollection that must be emptied before the
// parent couple doc is deleted. Paths are built as couples/{coupleId}/{sub}.
// There is intentionally no top-level `memory_photos` entry: photos live at
// couples/{coupleId}/memory_photos (see MemoryBoard, firestore.rules).
export const COUPLE_SUBCOLLECTIONS = [
  "messages",
  "sessions",
  "memory_photos",
  "milestones",
  "typing",
] as const;

export type CoupleSubcollection = (typeof COUPLE_SUBCOLLECTIONS)[number];

// Interface helper: full subcollection paths for one couple.
export function coupleSubcollectionPaths(coupleId: string): string[] {
  return COUPLE_SUBCOLLECTIONS.map((sub) => `couples/${coupleId}/${sub}`);
}

// Interface: list all couple ids in the `couples` collection.
export async function listCoupleIds(
  adminDb: FirebaseFirestore.Firestore,
): Promise<string[]> {
  const snap = await adminDb.collection("couples").get();
  return snap.docs.map((d) => d.id);
}

// Interface: delete every doc in each couple-owned subcollection in <=500
// batches. Returns per-subcollection doc counts for reporting.
export async function deleteCoupleTree(
  adminDb: FirebaseFirestore.Firestore,
  coupleId: string,
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const sub of COUPLE_SUBCOLLECTIONS) {
    const snap = await adminDb
      .collection("couples")
      .doc(coupleId)
      .collection(sub)
      .get();
    counts[sub] = snap.size;
    const refs = snap.docs.map((d) => d.ref);
    for (let i = 0; i < refs.length; i += BATCH_SIZE) {
      const batch = adminDb.batch();
      refs.slice(i, i + BATCH_SIZE).forEach((ref) => batch.delete(ref));
      await batch.commit();
    }
  }
  return counts;
}
