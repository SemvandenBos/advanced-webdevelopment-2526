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
  serverTimestamp,
  onSnapshot,
  arrayUnion,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Huishoudboekje } from '@/types';

export function subscribeHuishoudboekjes(
  userId: string,
  onData: (books: Huishoudboekje[]) => void
): Unsubscribe {
  let ownerBooks: Huishoudboekje[] = [];
  let memberBooks: Huishoudboekje[] = [];

  const merge = () => {
    const map = new Map<string, Huishoudboekje>();
    [...ownerBooks, ...memberBooks].forEach(b => map.set(b.id, b));
    onData(Array.from(map.values()));
  };

  const unsubOwner = onSnapshot(
    query(
      collection(db, 'huishoudboekjes'),
      where('ownerUid', '==', userId),
      where('archived', '==', false),
      orderBy('createdAt', 'desc')
    ),
    snap => {
      ownerBooks = snap.docs.map(d => ({ id: d.id, ...d.data() } as Huishoudboekje));
      merge();
    }
  );

  const unsubMember = onSnapshot(
    query(
      collection(db, 'huishoudboekjes'),
      where('members', 'array-contains', userId),
      where('archived', '==', false)
    ),
    snap => {
      memberBooks = snap.docs.map(d => ({ id: d.id, ...d.data() } as Huishoudboekje));
      merge();
    }
  );

  return () => {
    unsubOwner();
    unsubMember();
  };
}

export function subscribeArchivedHuishoudboekjes(
  userId: string,
  onData: (books: Huishoudboekje[]) => void
): Unsubscribe {
  return onSnapshot(
    query(
      collection(db, 'huishoudboekjes'),
      where('ownerUid', '==', userId),
      where('archived', '==', true),
      orderBy('createdAt', 'desc')
    ),
    snap => {
      onData(snap.docs.map(d => ({ id: d.id, ...d.data() } as Huishoudboekje)));
    }
  );
}

export async function getHuishoudboekje(id: string): Promise<Huishoudboekje | null> {
  const snap = await getDoc(doc(db, 'huishoudboekjes', id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Huishoudboekje;
}

export async function createHuishoudboekje(
  userId: string,
  data: { name: string; description: string }
): Promise<string> {
  const ref = await addDoc(collection(db, 'huishoudboekjes'), {
    name: data.name,
    description: data.description,
    ownerUid: userId,
    members: [],
    archived: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateHuishoudboekje(
  id: string,
  data: Partial<Pick<Huishoudboekje, 'name' | 'description'>>
): Promise<void> {
  await updateDoc(doc(db, 'huishoudboekjes', id), data);
}

export async function archiveHuishoudboekje(id: string): Promise<void> {
  await updateDoc(doc(db, 'huishoudboekjes', id), { archived: true });
}

export async function restoreHuishoudboekje(id: string): Promise<void> {
  await updateDoc(doc(db, 'huishoudboekjes', id), { archived: false });
}

export async function deleteHuishoudboekje(id: string): Promise<void> {
  await deleteDoc(doc(db, 'huishoudboekjes', id));
}

export async function addMember(id: string, memberUid: string): Promise<void> {
  await updateDoc(doc(db, 'huishoudboekjes', id), {
    members: arrayUnion(memberUid),
  });
}
