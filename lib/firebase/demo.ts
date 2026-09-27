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

// Mock Firestore helpers
export interface DemoDocSnapshot {
  exists: () => boolean;
  data: () => any;
  id: string;
}

export interface DemoQuerySnapshot {
  empty: boolean;
  docs: Array<{ id: string; data: () => any }>;
}

export interface DemoTransaction {
  get(ref: any): Promise<{ exists: boolean; data: any }>;
  set(ref: any, data: any): Promise<void>;
  update(ref: any, data: any): Promise<void>;
  delete(ref: any): Promise<void>;
}

export async function getDoc(ref: any): Promise<DemoDocSnapshot> {
  // Always return the mock user profile in Demo mode for any user fetch
  return {
    exists: () => true,
    data: () => seed.users[DEMO_USER_ID],
    id: (ref as any)?.id ?? 'demo',
  };
}

export async function setDoc(ref: any, data: any): Promise<void> {
  // no-op
}

export async function updateDoc(ref: any, data: any): Promise<void> {
  // no-op
}

export async function deleteDoc(ref: any): Promise<void> {
  // no-op
}

export function collection(parent: any, path: string): any {
  return { __demoCollection: true, path };
}

export async function addDoc(collection: any, data: any): Promise<{ id: string }> {
  return { id: Math.random().toString(36).substring(2, 15) };
}

export function query(...args: any[]): any {
  return { __demoQuery: true, args };
}

export async function getDocs(query: any): Promise<DemoQuerySnapshot> {
  return { empty: true, docs: [] };
}

export function orderBy(field: string, directionStr?: 'asc' | 'desc'): any {
  return { __demoOrderBy: true, field, directionStr };
}

export function where(field: string, opStr: string, value: any): any {
  return { __demoWhere: true, field, opStr, value };
}

export function limit(n: number): any {
  return { __demoLimit: true, n };
}

export async function runTransaction(
  firestore: any,
  updateFunction: (tx: DemoTransaction) => Promise<any>
): Promise<any> {
  const tx: DemoTransaction = {
    get: async (ref: any) => ({ exists: false, data: null }),
    set: async (ref: any, data: any) => { },
    update: async (ref: any, data: any) => { },
    delete: async (ref: any) => { },
  };
  return await updateFunction(tx);
}

export function doc(db: any, path: string, ...pathSegments: string[]): any {
  const fullPath = pathSegments.length > 0 ? `${path}/${pathSegments.join('/')}` : path;
  const id = pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : path;
  return { id, path: fullPath, __demoDoc: true };
}

export function writeBatch(_db: any): any {
  return {
    set: (_ref: any, _data: any) => {},
    update: (_ref: any, _data: any) => {},
    delete: (_ref: any) => {},
    commit: async () => {},
  };
}

export function serverTimestamp(): any {
  return { __demoTimestamp: true, toDate: () => new Date(), toMillis: () => Date.now() };
}

export function onSnapshot(
  _ref: any,
  callback: (snapshot: any) => void,
  _onError?: (err: Error) => void
): () => void {
  // Immediately invoke callback with an empty snapshot so loading states resolve.
  // The snapshot supports both document-style (.exists(), .data()) and
  // collection-style (.docs) access patterns.
  const snapshot = {
    exists: () => false,
    data: () => null,
    docs: [] as Array<{ id: string; data: () => any }>,
    empty: true,
  };
  callback(snapshot);
  return () => {};
}