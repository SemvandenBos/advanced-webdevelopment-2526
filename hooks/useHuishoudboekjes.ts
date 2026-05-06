'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  subscribeHuishoudboekjes,
  subscribeArchivedHuishoudboekjes,
} from '@/lib/firestore/huishoudboekjes';
import { Huishoudboekje } from '@/types';

export function useHuishoudboekjes() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Huishoudboekje[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsub = subscribeHuishoudboekjes(user.uid, data => {
      setBooks(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  return { books, loading };
}

export function useArchivedHuishoudboekjes() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Huishoudboekje[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const unsub = subscribeArchivedHuishoudboekjes(user.uid, data => {
      setBooks(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  return { books, loading };
}
