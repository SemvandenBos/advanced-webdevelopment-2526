import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth } from './firebase';
import { createUserDocument } from './firestore/users';

const googleProvider = new GoogleAuthProvider();

export const signInWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password);

export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string
) => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await createUserDocument(credential.user.uid, email, displayName);
  return credential;
};

export const signInWithGoogle = async () => {
  const credential = await signInWithPopup(auth, googleProvider);
  const { uid, email, displayName } = credential.user;
  await createUserDocument(uid, email ?? '', displayName ?? '');
  return credential;
};

export const signOut = () => firebaseSignOut(auth);
