'use client';

import { useEffect, useState } from 'react';
import { collection, query, QueryConstraint, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UseFirestoreReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

export function useFirestore<T>(
  collectionName: string,
  constraints?: QueryConstraint[]
): UseFirestoreReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const q = constraints
        ? query(collection(db, collectionName), ...constraints)
        : collection(db, collectionName);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const docs: T[] = [];
        snapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(docs);
        setError(null);
      });

      setLoading(false);
      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Firestore error');
      setLoading(false);
    }
  }, [collectionName, constraints]);

  return { data, loading, error };
}
