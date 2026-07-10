"use client";

import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  DocumentReference,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import { handleFirestoreError, OperationType } from './firestore-errors';
import type {
  UserProfile,
  Couple,
  Quiz,
  ChatMessage,
  PairingCode,
  Achievement,
  Session,
} from '../global.d';

export interface BatchWriteOperation {
  type: 'set' | 'update' | 'delete';
  ref: DocumentReference;
  data?: Record<string, any>;
}

function normalizeTimestamp(value: any): number {
  if (!value) return Date.now();
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (typeof value === 'number') return value;
  return Date.now();
}

function normalizeDate(value: any): Date {
  if (!value) return new Date();
  if (typeof value.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === 'number') return new Date(value);
  return new Date();
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const ref = doc(db, 'users', userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      ...(data as Omit<UserProfile, 'createdAt' | 'updatedAt'>),
      createdAt: normalizeTimestamp(data.createdAt),
      updatedAt: normalizeTimestamp(data.updatedAt),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `users/${userId}`);
    throw error;
  }
}

async function getCouple(coupleId: string): Promise<Couple | null> {
  try {
    const ref = doc(db, 'couples', coupleId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data() as Couple;
    return {
      ...data,
      createdAt: normalizeTimestamp(data.createdAt),
      updatedAt: normalizeTimestamp(data.updatedAt),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `couples/${coupleId}`);
    throw error;
  }
}

async function getQuiz(quizId: string): Promise<Quiz | null> {
  try {
    const ref = doc(db, 'quizzes', quizId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      ...(data as Omit<Quiz, 'questions'>),
      questions: Array.isArray(data.questions) ? data.questions : [],
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `quizzes/${quizId}`);
    throw error;
  }
}

export async function getPairingCode(code: string): Promise<PairingCode | null> {
  try {
    const ref = doc(db, 'pairingCodes', code);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data() as PairingCode;
    return {
      ...data,
      createdAt: normalizeTimestamp(data.createdAt),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `pairingCodes/${code}`);
    throw error;
  }
}

async function getAchievements(userId: string): Promise<Achievement[]> {
  try {
    const col = collection(db, 'achievements', userId, 'items');
    const snap = await getDocs(col);
    return snap.docs.map((doc) => {
      const data = doc.data() as Omit<Achievement, 'id'>;
      return {
        id: doc.id,
        ...data,
        unlockedAt: data.unlockedAt !== undefined ? normalizeTimestamp(data.unlockedAt) : undefined,
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `achievements/${userId}/items`);
    throw error;
  }
}

async function getSession(sessionId: string): Promise<Session | null> {
  try {
    const ref = doc(db, 'sessions', sessionId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      ...(data as Omit<Session, 'createdAt' | 'updatedAt'>),
      createdAt: normalizeTimestamp(data.createdAt),
      updatedAt: normalizeTimestamp(data.updatedAt),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `sessions/${sessionId}`);
    throw error;
  }
}

async function getChatMessages(coupleId: string, options?: { limit?: number }): Promise<
  (ChatMessage & { id: string })[]
> {
  try {
    const col = collection(db, 'couples', coupleId, 'messages');
    const q = query(
      col,
      orderBy('timestamp', 'asc'),
      limit(options?.limit ?? 50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        senderId: data.senderId,
        text: data.text,
        timestamp: normalizeDate(data.timestamp),
      };
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, `couples/${coupleId}/messages`);
    throw error;
  }
}

export async function batchWrite(writes: BatchWriteOperation[]): Promise<void> {
  if (writes.length === 0) return;
  if (writes.length > 500) {
    throw new Error(
      `batchWrite supports at most 500 operations (${writes.length} provided).`
    );
  }
  try {
    const batch = writeBatch(db);
    for (const op of writes) {
      if (op.type === 'set') {
        batch.set(op.ref, op.data ?? {});
      } else if (op.type === 'update') {
        batch.update(op.ref, op.data ?? {});
      } else if (op.type === 'delete') {
        batch.delete(op.ref);
      }
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, null);
    throw error;
  }
}

export async function createPairingCode(userId: string): Promise<string> {
  try {
    const code = userId.slice(0, 8).toUpperCase();
    const ref = doc(db, 'pairingCodes', code);
    await setDoc(ref, {
      userId,
      createdAt: Date.now(),
    });
    return code;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `pairingCodes/${userId.slice(0, 8).toUpperCase()}`);
    throw error;
  }
}

export async function deletePairingCode(code: string): Promise<void> {
  try {
    const ref = doc(db, 'pairingCodes', code);
    await deleteDoc(ref);
  } catch {
    // Best-effort: don't throw if the code was already removed.
  }
}

export async function addMessage(
  coupleId: string,
  message: Omit<ChatMessage, 'id' | 'timestamp'>
): Promise<string> {
  try {
    const col = collection(db, 'couples', coupleId, 'messages');
    const payload: Record<string, any> = {
      senderId: message.senderId,
      text: message.text,
      timestamp: new Date(),
    };
    const ref = await addDoc(col, payload);
    return ref.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `couples/${coupleId}/messages`);
    throw error;
  }
}

export async function createUserProfile(
  userId: string,
  data: { email: string; displayName?: string }
): Promise<void> {
  try {
    const ref = doc(db, 'users', userId);
    const now = Date.now();
    await setDoc(
      ref,
      {
        email: data.email,
        displayName: data.displayName ?? '',
        points: 0,
        pairedCoupleId: '',
        streak: 0,
        createdAt: now,
        updatedAt: now,
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `users/${userId}`);
    throw error;
  }
}