import { doc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import type { AppUser } from '../../types';

export const createUserDocument = async (
  uid: string,
  email: string,
  displayName: string
): Promise<void> => {
  const ref = doc(db, 'users', uid);
  const snapshot = await getDoc(ref);
  if (snapshot.exists()) return;

  await setDoc(ref, {
    uid,
    email,
    displayName,
    createdAt: serverTimestamp(),
  });
};

export const getUserDocument = async (uid: string): Promise<AppUser | null> => {
  const snapshot = await getDoc(doc(db, 'users', uid));
  return snapshot.exists() ? (snapshot.data() as AppUser) : null;
};

export const getUserByEmail = async (email: string): Promise<AppUser | null> => {
  const q = query(collection(db, 'users'), where('email', '==', email));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as AppUser;
};
