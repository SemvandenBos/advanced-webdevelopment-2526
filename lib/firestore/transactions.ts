import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Transaction } from '@/types/models';

function txCol(bookId: string) {
  return collection(db, 'huishoudboekjes', bookId, 'transactions');
}

export function subscribeTransactions(
  bookId: string,
  year: number,
  month: number,
  onData: (txs: Transaction[]) => void
): Unsubscribe {
  const start = Timestamp.fromDate(new Date(year, month, 1));
  const end = Timestamp.fromDate(new Date(year, month + 1, 1));

  return onSnapshot(
    query(
      txCol(bookId),
      where('date', '>=', start),
      where('date', '<', end),
      orderBy('date', 'desc')
    ),
    snap => onData(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)))
  );
}

export function subscribeAllTransactions(
  bookId: string,
  onData: (txs: Transaction[]) => void
): Unsubscribe {
  return onSnapshot(
    query(txCol(bookId), orderBy('date', 'asc')),
    snap => onData(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)))
  );
}

export async function getTransaction(bookId: string, txId: string): Promise<Transaction | null> {
  const snap = await getDoc(doc(txCol(bookId), txId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Transaction;
}

export async function createTransaction(
  bookId: string,
  userId: string,
  data: {
    amount: number;
    description: string;
    date: Date;
    type: 'income' | 'expense';
    categoryId: string;
  }
): Promise<string> {
  const ref = await addDoc(txCol(bookId), {
    amount: data.amount,
    description: data.description,
    date: Timestamp.fromDate(data.date),
    type: data.type,
    categoryId: data.categoryId,
    createdBy: userId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateTransaction(
  bookId: string,
  txId: string,
  data: {
    amount?: number;
    description?: string;
    date?: Date;
    type?: 'income' | 'expense';
    categoryId?: string;
  }
): Promise<void> {
  const payload: Record<string, unknown> = { ...data };
  if (data.date !== undefined) payload.date = Timestamp.fromDate(data.date);
  await updateDoc(doc(txCol(bookId), txId), payload);
}

export async function deleteTransaction(bookId: string, txId: string): Promise<void> {
  await deleteDoc(doc(txCol(bookId), txId));
}
