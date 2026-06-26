"use client";

import { useState, useEffect } from 'react';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';

export function useFirestoreDocument<T>(
  pathSegments: string[]
): { data: T | null; loading: boolean; error: Error | null } {
  const pathKey = pathSegments.join('/');
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!pathSegments.length) {
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