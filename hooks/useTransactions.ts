'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { subscribeTransactions, subscribeAllTransactions } from '@/lib/firestore/transactions';
import { Transaction } from '@/types/models';

export function useTransactions(bookId: string, year: number, month: number) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeTransactions(bookId, year, month, data => {
      setTransactions(data);
      setLoading(false);
    });
    return unsub;
  }, [bookId, year, month]);

  const summary = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expenses, balance: income - expenses };
  }, [transactions]);

  return { transactions, loading, summary };
}

const PAGE_SIZE = 20;

export function useInfiniteTransactions(bookId: string) {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setLoading(true);
    setVisibleCount(PAGE_SIZE);
    const unsub = subscribeAllTransactions(bookId, data => {
      setAllTransactions(data);
      setLoading(false);
    });
    return unsub;
  }, [bookId]);

  const sorted = useMemo(
    () => [...allTransactions].sort((a, b) => b.date.toMillis() - a.date.toMillis()),
    [allTransactions],
  );

  const transactions = useMemo(() => sorted.slice(0, visibleCount), [sorted, visibleCount]);

  const hasMore = visibleCount < sorted.length;

  const loadMore = useCallback(() => {
    setVisibleCount(prev => prev + PAGE_SIZE);
  }, []);

  return { transactions, loadMore, loading, hasMore };
}

export interface MonthlyTotal {
  label: string;
  income: number;
  expenses: number;
}

export function useMonthlyChartData(bookId: string) {
  const [data, setData] = useState<MonthlyTotal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeAllTransactions(bookId, txs => {
      const map = new Map<string, MonthlyTotal>();

      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
        const label = d.toLocaleDateString('nl-NL', { month: 'short', year: '2-digit' });
        map.set(key, { label, income: 0, expenses: 0 });
      }

      txs.forEach(tx => {
        const d = tx.date.toDate();
        const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
        const entry = map.get(key);
        if (entry) {
          if (tx.type === 'income') entry.income += tx.amount;
          else entry.expenses += tx.amount;
        }
      });

      setData(Array.from(map.values()));
      setLoading(false);
    });
    return unsub;
  }, [bookId]);

  return { data, loading };
}
