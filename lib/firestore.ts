"use client";

/**
 * Demo-aware Firestore function re-exports.
 *
 * When NEXT_PUBLIC_DEMO_MODE=true, the real Firebase Firestore functions are
 * replaced with in-memory mocks so the app renders without backend credentials.
 * Consumers must import Firestore functions from this module instead of
 * directly from 'firebase/firestore' so demo mode is respected.
 */

import { isDemo } from "./firebase/client";
import * as demo from "./firebase/demo";
import * as firebase from "firebase/firestore";

// Single adapter-selection seam: pick the backing implementation once.
// Every export below is a plain typed delegation off this one object —
// no per-export ternaries and no any-typed rest-parameter wrappers.
const adapter: typeof firebase =
  (isDemo ? demo : firebase) as unknown as typeof firebase;

export const doc: typeof firebase.doc = adapter.doc;
export const collection: typeof firebase.collection = adapter.collection;
export const getDoc: typeof firebase.getDoc = adapter.getDoc;
export const setDoc: typeof firebase.setDoc = adapter.setDoc;
export const updateDoc: typeof firebase.updateDoc = adapter.updateDoc;
export const deleteDoc: typeof firebase.deleteDoc = adapter.deleteDoc;
export const addDoc: typeof firebase.addDoc = adapter.addDoc;
export const getDocs: typeof firebase.getDocs = adapter.getDocs;
export const query: typeof firebase.query = adapter.query;
export const where: typeof firebase.where = adapter.where;
export const orderBy: typeof firebase.orderBy = adapter.orderBy;
export const limit: typeof firebase.limit = adapter.limit;
export const writeBatch: typeof firebase.writeBatch = adapter.writeBatch;
export const runTransaction: typeof firebase.runTransaction =
  adapter.runTransaction;
export const serverTimestamp: typeof firebase.serverTimestamp =
  adapter.serverTimestamp;
export const onSnapshot: typeof firebase.onSnapshot = adapter.onSnapshot;

export const FirestoreError = firebase.FirestoreError;
export type DocumentData = firebase.DocumentData;
export type DocumentReference = firebase.DocumentReference;
export type QueryConstraint = firebase.QueryConstraint;
