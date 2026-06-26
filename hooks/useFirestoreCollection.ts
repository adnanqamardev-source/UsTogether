"use client";

import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  query,
  QueryConstraint,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { handleFirestoreError, OperationType } from '@/lib/firestore-errors';

function defaultTransform<T>(id: string, data: DocumentData): T {
  return data as T;
}

export function useFirestoreCollection<T>(
  pathSegments: string[],
  constraints: QueryConstraint[] = [],
  transform = defaultTransform<T>
): { data: T[]; loading: boolean; error: Error | null } {
  const pathKey = pathSegments.join('/');
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!pathSegments.length) {
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