import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import { db } from './firebase';
import type { AppUser } from '../types/auth';

export async function upsertUser(user: AppUser): Promise<void> {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  const now = serverTimestamp();

  // RN Firebase mengekspos `exists` sebagai properti boolean; guard untuk kompatibilitas.
  const exists =
    typeof (snap as { exists: unknown }).exists === 'function'
      ? (snap as unknown as { exists: () => boolean }).exists()
      : (snap as unknown as { exists: boolean }).exists;

  const base = {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    provider: user.provider,
  };

  if (exists) {
    await updateDoc(ref, { ...base, lastLoginAt: now, updatedAt: now });
  } else {
    await setDoc(ref, {
      ...base,
      createdAt: now,
      lastLoginAt: now,
      updatedAt: now,
    });
  }
}
