"use client";

import { useState, useEffect } from 'react';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';

// SHORT-CIRCUIT: normalize the path. If it's missing, empty, or contains an
// "undefined"/"null" segment, treat it as an empty path so we never fire a
// Firestore read on behalf of a not-ready user.
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

export function useFirestoreDocument<T>(
  pathSegments: string[] | undefined
): { data: T | null; loading: boolean; error: Error | null } {
  const safeSegments = normalizePath(pathSegments);
  const pathKey = safeSegments.join('/');
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!safeSegments.length) {
      setLoading(false);
      return;
    }
    const ref = doc(db, pathKey);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (snapshot.exists()) {
          setData(snapshot.data() as T);
        } else {
          setData(null);
        }
        setLoading(false);
        setError(null);
      },
      (err) => {
        setLoading(false);
        setError(err);
        handleFirestoreError(err, OperationType.GET, pathKey);
      }
    );
    return () => unsubscribe();
  }, [pathKey]);

  return { data, loading, error };
}