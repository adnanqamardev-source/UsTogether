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

// In demo mode, delegate to the mock implementations.
// In production, re-export the real Firebase functions.
// Each function is wrapped to preserve proper typing in both modes.

export const doc: typeof firebase.doc = isDemo
  ? (...args: any[]) => (demo as any).doc(...args)
  : firebase.doc;

export const collection: typeof firebase.collection = isDemo
  ? (...args: any[]) => (demo as any).collection(...args)
  : firebase.collection;

export const getDoc: typeof firebase.getDoc = isDemo
  ? (...args: any[]) => (demo as any).getDoc(...args)
  : firebase.getDoc;

export const setDoc: typeof firebase.setDoc = isDemo
  ? (...args: any[]) => (demo as any).setDoc(...args)
  : firebase.setDoc;

export const updateDoc: typeof firebase.updateDoc = isDemo
  ? (...args: any[]) => (demo as any).updateDoc(...args)
  : firebase.updateDoc;

export const deleteDoc: typeof firebase.deleteDoc = isDemo
  ? (...args: any[]) => (demo as any).deleteDoc(...args)
  : firebase.deleteDoc;

export const addDoc: typeof firebase.addDoc = isDemo
  ? (...args: any[]) => (demo as any).addDoc(...args)
  : firebase.addDoc;

export const getDocs: typeof firebase.getDocs = isDemo
  ? (...args: any[]) => (demo as any).getDocs(...args)
  : firebase.getDocs;

export const query: typeof firebase.query = isDemo
  ? (...args: any[]) => (demo as any).query(...args)
  : firebase.query;

export const where: typeof firebase.where = isDemo
  ? (...args: any[]) => (demo as any).where(...args)
  : firebase.where;

export const orderBy: typeof firebase.orderBy = isDemo
  ? (...args: any[]) => (demo as any).orderBy(...args)
  : firebase.orderBy;

export const limit: typeof firebase.limit = isDemo
  ? (...args: any[]) => (demo as any).limit(...args)
  : firebase.limit;

export const writeBatch: typeof firebase.writeBatch = isDemo
  ? (...args: any[]) => (demo as any).writeBatch(...args)
  : firebase.writeBatch;

export const runTransaction: typeof firebase.runTransaction = isDemo
  ? (...args: any[]) => (demo as any).runTransaction(...args)
  : firebase.runTransaction;

export const serverTimestamp: typeof firebase.serverTimestamp = isDemo
  ? (...args: any[]) => (demo as any).serverTimestamp(...args)
  : firebase.serverTimestamp;

export const onSnapshot: typeof firebase.onSnapshot = isDemo
  ? (...args: any[]) => (demo as any).onSnapshot(...args)
  : firebase.onSnapshot;

export const FirestoreError = firebase.FirestoreError;
export type DocumentData = firebase.DocumentData;
export type DocumentReference = firebase.DocumentReference;
export type QueryConstraint = firebase.QueryConstraint;
