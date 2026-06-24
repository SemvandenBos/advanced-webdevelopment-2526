import type { Timestamp } from 'firebase/firestore';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount);
}

export function formatTransactionDate(ts: Timestamp): string {
  return ts.toDate().toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}
