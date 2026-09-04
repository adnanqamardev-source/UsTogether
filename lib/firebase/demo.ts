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
  currentUser: null as User | null,
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
export async function getDoc(ref: any): Promise<{ exists: boolean; data: any }> {
  return { exists: false, data: null };
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

export async function collection(parent: any, path: string): Promise<any> {
  return {};
}

export async function addDoc(collection: any, data: any): Promise<{ id: string }> {
  return { id: Math.random().toString(36).substring(2, 15) };
}

export async function query(...args: any[]): Promise<any> {
  return {};
}

export async function getDocs(query: any): Promise<{ empty: true; docs: [] }> {
  return { empty: true, docs: [] };
}

export function orderBy(field: string, directionStr?: 'asc' | 'desc'): any {
  return {};
}

export function where(field: string, opStr: string, value: any): any {
  return {};
}

export function limit(n: number): any {
  return {};
}

export async function runTransaction(firestore: any, updateFunction: (tx: any) => Promise<any>): Promise<any> {
  const tx = {
    get: async (ref: any) => ({ exists: false, data: null }),
    set: async (ref: any, data: any) => { },
    update: async (ref: any, data: any) => { },
    delete: async (ref: any) => { },
  };
  return await updateFunction(tx);
}