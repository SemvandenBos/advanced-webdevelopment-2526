'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { subscribeTransactions, subscribeAllTransactions } from '@/lib/firestore/transactions';
import { Transaction } from '@/types';

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

export function useInfiniteTransactions(bookId: string) {
  const [months, setMonths] = useState<{ year: number; month: number }[]>(() => {
    const now = new Date();
    return [{ year: now.getFullYear(), month: now.getMonth() }];
  });
  const [transactionsByMonth, setTransactionsByMonth] = useState<Map<string, Transaction[]>>(new Map());
  const unsubscribersRef = useRef<(() => void)[]>([]);

  // Subscribe only to the newest month each time one is added
  useEffect(() => {
    const { year, month } = months[months.length - 1];
    const key = `${year}-${String(month).padStart(2, '0')}`;
    const unsub = subscribeTransactions(bookId, year, month, data => {
      setTransactionsByMonth(prev => {
        const next = new Map(prev);
        next.set(key, data);
        return next;
      });
    });
    unsubscribersRef.current.push(unsub);
    // Intentionally no cleanup return — keep all month subscriptions alive until unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [months.length]);

  useEffect(() => {
    return () => { unsubscribersRef.current.forEach(u => u()); };
  }, []);

  const transactions = useMemo(
    () =>
      Array.from(transactionsByMonth.values())
        .flat()
        .sort((a, b) => b.date.toMillis() - a.date.toMillis()),
    [transactionsByMonth],
  );

  const loadMore = useCallback(() => {
    setMonths(prev => {
      const { year, month } = prev[prev.length - 1];
      const d = new Date(year, month - 1);
      return [...prev, { year: d.getFullYear(), month: d.getMonth() }];
    });
  }, []);

  const loading = transactionsByMonth.size === 0;

  return { transactions, loadMore, loading };
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
