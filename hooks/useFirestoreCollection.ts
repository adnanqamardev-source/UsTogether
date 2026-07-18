"use client";

import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  query,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';

function defaultTransform<T>(id: string, data: DocumentData): T {
  return data as T;
}

// SHORT-CIRCUIT: normalize the path. If it's missing, empty, or contains an
// "undefined"/"null" segment (e.g. 'couples/undefined/sessions'), treat it as
// an empty path so we never fire a Firestore query on behalf of a not-ready user.
function normalizePath(pathSegments?: string[]): string[] {
  if (
    !pathSegments ||
    pathSegments.length === 0 ||
    pathSegments.includes('undefined') ||
    pathSegments.includes('null')
  ) {
    return [];
  }
  return pathSegments;
}

export function useFirestoreCollection<T>(
  pathSegments: string[] | undefined,
  constraints: QueryConstraint[] = [],
  transform = defaultTransform<T>
): { data: T[]; loading: boolean; error: Error | null } {
  const safeSegments = normalizePath(pathSegments);
  const pathKey = safeSegments.join('/');
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!safeSegments.length) {
      setLoading(false);
      return;
    }
    const colRef = collection(db, pathKey);
    const finalQuery = query(colRef, ...constraints);
    const unsubscribe = onSnapshot(
      finalQuery,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => transform(doc.id, doc.data()));
        setData(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setLoading(false);
        setError(err);
        handleFirestoreError(err, OperationType.LIST, pathKey);
      }
    );
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathKey]);

  return { data, loading, error };
}