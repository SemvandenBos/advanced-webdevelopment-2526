'use client';

import { useState, useEffect, useMemo } from 'react';
import { subscribeCategories } from '@/lib/firestore/categories';
import { subscribeAllTransactions } from '@/lib/firestore/transactions';
import { Category } from '@/types';

export function useCategories(bookId: string) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeCategories(bookId, data => {
      setCategories(data);
      setLoading(false);
    });
    return unsub;
  }, [bookId]);

  return { categories, loading };
}

export function useCategorySpending(bookId: string) {
  const [transactions, setTransactions] = useState<{ categoryId: string; type: string; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeAllTransactions(bookId, txs => {
      setTransactions(txs.map(t => ({ categoryId: t.categoryId, type: t.type, amount: t.amount })));
      setLoading(false);
    });
    return unsub;
  }, [bookId]);

  const spending = useMemo(() => {
    const map = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.type === 'expense' && tx.categoryId) {
        map.set(tx.categoryId, (map.get(tx.categoryId) ?? 0) + tx.amount);
      }
    }
    return map;
  }, [transactions]);

  return { spending, loading };
}
