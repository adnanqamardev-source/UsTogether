// Mock Firebase demo implementation
import { seed, DEMO_USER_ID } from "./demo-seed";

export interface DocumentData {
  [key: string]: any;
}

export class FirestoreError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'FirestoreError';
    this.code = code;
  }
}

// Mock Firebase Auth
export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  getIdToken(forceRefresh?: boolean): Promise<string>;
};

export type Auth = any;

export class DemoUser implements User {
  uid = DEMO_USER_ID;
  email = "alex@ustogether.demo";
  displayName = "Alex";
  photoURL = null;
  async getIdToken(): Promise<string> {
    return "demo-id-token";
  }
}

export const demoAuth: any = {
  __demo: true,
  currentUser: new DemoUser(),
  _cb: null as ((u: User | null) => void) | null,
  onAuthStateChanged(cb: (u: User | null) => void) {
    this._cb = cb;
    setTimeout(() => cb(this.currentUser), 0);
    return () => {
      this._cb = null;
    };
  },
  async setDemoUser() {
    this.currentUser = new DemoUser();
    if (this._cb) this._cb(this.currentUser);
  },
  async signOut() {
    this.currentUser = null;
    if (this._cb) this._cb(null);
  },
};

export function getAuth(_app?: any): Auth {
  return demoAuth;
}

export class GoogleAuthProvider {
  static PROVIDER_ID = "google.com";
}

export async function signInWithPopup(auth: any, _provider: any): Promise<{ user: User }> {
  await new Promise((r) => setTimeout(r, 400));
  await auth.setDemoUser();
  return { user: auth.currentUser };
}

export async function signOut(auth: any): Promise<void> {
  await auth.signOut();
}

// Mock Firestore
export interface Firestore {
  __demo: true;
}

export const demoDb: Firestore = { __demo: true };

export function getFirestore(_app?: any): Firestore {
  return demoDb;
}

export function initializeFirestore(_app: any, _opts?: any): Firestore {
  return demoDb;
}

export function persistentLocalCache(): { __demo: true } {
  return { __demo: true };
}

// Mock Storage
export interface FirebaseStorage {
  __demo: true;
}

export const demoStorage: FirebaseStorage = { __demo: true };

export function getStorage(_app?: any): FirebaseStorage {
  return demoStorage;
}

export interface StorageReference {
  path: string;
}

export function ref(storage: FirebaseStorage, path: string): StorageReference {
  return { path };
}

export async function getDownloadURL(fileRef: StorageReference): Promise<string> {
  try {
    return URL.createObjectURL(new Blob(["demo"], { type: "image/png" }));
  } catch {
    return `data:image/svg+xml;utf8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="#8b5cf6"/><text x="200" y="150" font-family="system-ui" font-size="20" fill="white" text-anchor="middle">${fileRef.path.split("/").pop() || "demo"}</text></svg>`
    )}`;
  }
}

export async function uploadBytesResumable(fileRef: StorageReference, file: Blob): Promise<any> {
  const task: any = {
    snapshot: { ref: fileRef, bytesTransferred: file.size, totalBytes: file.size },
    on() {
      const complete = arguments[2];
      if (typeof complete === "function") setTimeout(complete, 50);
      return () => {};
    },
    then(resolve: (v: any) => void) {
      resolve({ ref: fileRef });
      return Promise.resolve({ ref: fileRef });
    },
  };
  return task;
}

export async function deleteObject(_fileRef: StorageReference): Promise<void> {}

// ---------------------------------------------------------------------------
// In-memory Firestore
//
// This used to be a set of no-op stubs: `addDoc` threw the written data away
// and `onSnapshot` always emitted an empty snapshot. Anything that created a
// document (e.g. "Fetch New Quiz") silently vanished, which is why the create
// flows appeared to do nothing. It is now backed by a real store seeded from
// `demo-seed`, and every write notifies the matching `onSnapshot` listeners.
// ---------------------------------------------------------------------------

export interface DemoDocSnapshot {
  exists: () => boolean;
  data: () => any;
  id: string;
}

export interface DemoQuerySnapshot {
  empty: boolean;
  docs: Array<{ id: string; data: () => any }>;
  size: number;
  forEach: (cb: (d: { id: string; data: () => any }) => void) => void;
}

export interface DemoTransaction {
  get(ref: any): Promise<{ exists: boolean; data: any }>;
  set(ref: any, data: any): Promise<void>;
  update(ref: any, data: any): Promise<void>;
  delete(ref: any): Promise<void>;
}

type DocMap = Map<string, any>;

/** collection path -> (docId -> data) */
const store = new Map<string, DocMap>();

type Listener = { paths: Set<string>; emit: () => void };
const listeners = new Set<Listener>();

/** Deep clone so callers cannot mutate stored data by reference. */
function clone<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value;
  return JSON.parse(JSON.stringify(value));
}

function ensure(path: string): DocMap {
  let docs = store.get(path);
  if (!docs) {
    docs = new Map();
    store.set(path, docs);
  }
  return docs;
}

function seedStore() {
  for (const [path, docs] of Object.entries(seed as Record<string, any>)) {
    if (!docs || typeof docs !== 'object') continue;
    const target = ensure(path);
    for (const [id, data] of Object.entries(docs)) {
      target.set(id, clone(data));
    }
  }
}

seedStore();

/** Notify every listener whose watched paths intersect the changed path. */
function notify(changedPath: string) {
  for (const listener of [...listeners]) {
    for (const watched of listener.paths) {
      // A listener on `quizzes` cares about `quizzes`; a listener on
      // `couples/c1/sessions` cares only about that subcollection.
      if (watched === changedPath) {
        listener.emit();
        break;
      }
    }
  }
}

function resolveCollectionPath(parent: any, path: string): string {
  // `collection(db, 'quizzes')` -> 'quizzes'
  // `collection(doc(db, 'couples', id), 'sessions')` -> 'couples/<id>/sessions'
  if (parent && parent.__demoDoc && typeof parent.path === 'string') {
    return `${parent.path}/${path}`;
  }
  return path;
}

function docPathOf(ref: any): string {
  return ref && typeof ref.path === 'string' ? ref.path : '';
}

function makeDocSnapshot(id: string, data: any): DemoDocSnapshot {
  return {
    id,
    exists: () => data !== undefined,
    data: () => (data === undefined ? undefined : clone(data)),
  };
}

function matches(data: any, constraints: any[]): boolean {
  return constraints.every((c) => {
    if (!c || !c.__demoWhere) return true;
    const actual = data?.[c.field];
    // Accept both `op` (canonical) and `opStr` (legacy alias).
    const op = c.op ?? c.opStr;
    switch (op) {
      case '==': return actual === c.value;
      case '!=': return actual !== c.value;
      case '>': return actual > c.value;
      case '>=': return actual >= c.value;
      case '<': return actual < c.value;
      case '<=': return actual <= c.value;
      case 'array-contains': return Array.isArray(actual) && actual.includes(c.value);
      case 'array-contains-any': return Array.isArray(actual) && Array.isArray(c.value) && c.value.some((v: any) => actual.includes(v));
      case 'in': return Array.isArray(c.value) && c.value.includes(actual);
      case 'not-in': return Array.isArray(c.value) && !c.value.includes(actual);
      default: return true;
    }
  });
}

function buildQuerySnapshot(q: any): DemoQuerySnapshot {
  const docs = ensure(q.path);
  let entries = [...docs.entries()];

  for (const c of q.constraints || []) {
    if (c && c.__demoWhere) {
      entries = entries.filter(([, data]) => matches(data, [c]));
    }
  }

  for (const c of q.constraints || []) {
    if (c && c.__demoOrderBy) {
      const dir = c.directionStr === 'desc' ? -1 : 1;
      entries.sort(([, a], [, b]) => {
        const av = a?.[c.field];
        const bv = b?.[c.field];
        if (av === bv) return 0;
        if (av === undefined) return 1;
        if (bv === undefined) return -1;
        return av > bv ? dir : -dir;
      });
    }
  }

  const limitC = (q.constraints || []).find((c: any) => c && c.__demoLimit);
  if (limitC) entries = entries.slice(0, limitC.n);

  const out = entries.map(([id, data]) => makeDocSnapshot(id, data));
  return {
    empty: out.length === 0,
    docs: out,
    size: out.length,
    forEach: (cb) => out.forEach(cb),
  };
}

export function collection(parent: any, path: string): any {
  return { __demoCollection: true, path: resolveCollectionPath(parent, path) };
}

export function doc(db: any, path: string, ...pathSegments: string[]): any {
  const segs = [path, ...pathSegments];
  // `doc(collection(db, 'quizzes'), id)` is also valid in the real SDK.
  if (db && db.__demoCollection) {
    const full = `${db.path}/${segs.join('/')}`;
    return { id: segs[segs.length - 1], path: full, __demoDoc: true };
  }
  const fullPath = segs.join('/');
  return { id: segs[segs.length - 1], path: fullPath, __demoDoc: true };
}

export async function getDoc(ref: any): Promise<DemoDocSnapshot> {
  const fullPath = docPathOf(ref);
  const slash = fullPath.lastIndexOf('/');
  const collPath = slash === -1 ? '' : fullPath.slice(0, slash);
  const id = slash === -1 ? fullPath : fullPath.slice(slash + 1);
  const data = ensure(collPath).get(id);
  return makeDocSnapshot(id, data);
}

export function query(...args: any[]): any {
  const [collOrPath, ...rest] = args;
  const path = typeof collOrPath === 'string'
    ? collOrPath
    : collOrPath?.__demoCollection
      ? collOrPath.path
      : '';
  return { __demoQuery: true, path, constraints: rest };
}

export function where(field: string, opStr: string, value: any): any {
  // NOTE: both `op` (canonical) and `opStr` (legacy alias) are stored so
  // `matches()` filtering works regardless of which key callers inspect.
  // Previously only `opStr` was stored while `matches()` read `c.op`,
  // which meant where() constraints silently never filtered.
  return { __demoWhere: true, field, op: opStr, opStr, value };
}

export function orderBy(field: string, directionStr?: 'asc' | 'desc'): any {
  return { __demoOrderBy: true, field, directionStr };
}

export function limit(n: number): any {
  return { __demoLimit: true, n };
}

export async function getDocs(q: any): Promise<DemoQuerySnapshot> {
  return buildQuerySnapshot(q);
}

export async function addDoc(collRef: any, data: any): Promise<{ id: string }> {
  const path = collRef?.__demoCollection ? collRef.path : String(collRef);
  const id = Math.random().toString(36).substring(2, 15);
  ensure(path).set(id, clone(data));
  notify(path);
  return { id };
}

export async function setDoc(ref: any, data: any): Promise<void> {
  const fullPath = docPathOf(ref);
  const slash = fullPath.lastIndexOf('/');
  const collPath = slash === -1 ? '' : fullPath.slice(0, slash);
  const id = slash === -1 ? fullPath : fullPath.slice(slash + 1);
  ensure(collPath).set(id, clone(data));
  notify(collPath);
}

export async function updateDoc(ref: any, data: any): Promise<void> {
  const fullPath = docPathOf(ref);
  const slash = fullPath.lastIndexOf('/');
  const collPath = slash === -1 ? '' : fullPath.slice(0, slash);
  const id = slash === -1 ? fullPath : fullPath.slice(slash + 1);
  const docs = ensure(collPath);
  const existing = docs.get(id) ?? {};
  docs.set(id, { ...existing, ...clone(data) });
  notify(collPath);
}

export async function deleteDoc(ref: any): Promise<void> {
  const fullPath = docPathOf(ref);
  const slash = fullPath.lastIndexOf('/');
  const collPath = slash === -1 ? '' : fullPath.slice(0, slash);
  const id = slash === -1 ? fullPath : fullPath.slice(slash + 1);
  ensure(collPath).delete(id);
  notify(collPath);
}

export function writeBatch(_db: any): any {
  const pending: Array<() => void> = [];
  return {
    set: (ref: any, data: any) => { pending.push(() => { void setDoc(ref, data); }); },
    update: (ref: any, data: any) => { pending.push(() => { void updateDoc(ref, data); }); },
    delete: (ref: any) => { pending.push(() => { void deleteDoc(ref); }); },
    commit: async () => { pending.splice(0).forEach((fn) => fn()); },
  };
}

export async function runTransaction(
  _firestore: any,
  updateFunction: (tx: DemoTransaction) => Promise<any>,
): Promise<any> {
  const tx: DemoTransaction = {
    get: async (ref: any) => {
      const snap = await getDoc(ref);
      return { exists: snap.exists(), data: snap.data() };
    },
    set: async (ref: any, data: any) => { await setDoc(ref, data); },
    update: async (ref: any, data: any) => { await updateDoc(ref, data); },
    delete: async (ref: any) => { await deleteDoc(ref); },
  };
  return await updateFunction(tx);
}

export function serverTimestamp(): any {
  return { __demoTimestamp: true, toDate: () => new Date(), toMillis: () => Date.now() };
}

export function onSnapshot(
  ref: any,
  callback: (snapshot: any) => void,
  _onError?: (err: Error) => void,
): () => void {
  // Document listeners watch a single path; query listeners watch a
  // collection. Emitting immediately keeps loading states resolvable, and the
  // stored snapshot supports both `.exists()`/`.data()` and `.docs` access.
  const isDoc = !!(ref && ref.__demoDoc);
  const path = isDoc ? docPathOf(ref) : (ref?.path ?? '');
  const watched = isDoc
    ? (path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '')
    : path;

  const emit = () => {
    if (isDoc) {
      void getDoc(ref).then((snap) => {
        callback({
          ...snap,
          docs: snap.exists() ? [snap] : [],
          empty: !snap.exists(),
        });
      });
      return;
    }
    try {
      callback(buildQuerySnapshot(ref));
    } catch (err) {
      if (_onError) _onError(err as Error);
    }
  };

  const listener: Listener = { paths: new Set([watched]), emit };
  listeners.add(listener);
  emit();

  return () => {
    listeners.delete(listener);
  };
}

/** Test helper: wipe everything written at runtime and restore the seed. */
export function __resetDemoStore() {
  store.clear();
  seedStore();
}
