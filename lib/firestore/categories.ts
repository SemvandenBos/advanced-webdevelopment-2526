import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Category } from '@/types';

function catCol(bookId: string) {
  return collection(db, 'huishoudboekjes', bookId, 'categories');
}

export function subscribeCategories(
  bookId: string,
  onData: (cats: Category[]) => void
): Unsubscribe {
  return onSnapshot(
    query(catCol(bookId), orderBy('createdAt', 'asc')),
    snap => onData(snap.docs.map(d => ({ id: d.id, ...d.data() } as Category)))
  );
}

export async function getCategory(bookId: string, categoryId: string): Promise<Category | null> {
  const snap = await getDoc(doc(catCol(bookId), categoryId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Category;
}

export async function createCategory(
  bookId: string,
  data: { name: string; maxBudget: number; endDate?: Date }
): Promise<string> {
  const payload: Record<string, unknown> = {
    name: data.name,
    maxBudget: data.maxBudget,
    createdAt: serverTimestamp(),
  };
  if (data.endDate) payload.endDate = Timestamp.fromDate(data.endDate);
  const ref = await addDoc(catCol(bookId), payload);
  return ref.id;
}

export async function updateCategory(
  bookId: string,
  categoryId: string,
  data: { name?: string; maxBudget?: number; endDate?: Date | null }
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.maxBudget !== undefined) payload.maxBudget = data.maxBudget;
  if (data.endDate !== undefined) {
    payload.endDate = data.endDate ? Timestamp.fromDate(data.endDate) : null;
  }
  await updateDoc(doc(catCol(bookId), categoryId), payload);
}

export async function deleteCategory(bookId: string, categoryId: string): Promise<void> {
  await deleteDoc(doc(catCol(bookId), categoryId));
}
