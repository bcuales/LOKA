import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { LokaUserProfile } from '@/types/loka';

export const usersCollection = collection(db, 'users');

export function userDoc(uid: string) {
  return doc(db, 'users', uid);
}

export async function getUserProfile(uid: string) {
  const snapshot = await getDoc(userDoc(uid));
  return snapshot.exists() ? (snapshot.data() as LokaUserProfile) : null;
}

export async function upsertUserProfile(profile: LokaUserProfile) {
  await setDoc(userDoc(profile.uid), profile, { merge: true });
}

export async function markOnboardingCompleted(uid: string) {
  await updateDoc(userDoc(uid), {
    onboardingCompleted: true,
    updatedAt: Date.now(),
  } as Partial<LokaUserProfile>);
}

export async function getDiscoverUsers(options: {
  excludeUid: string;
  limitCount?: number;
}) {
  const q = query(usersCollection, limit(options.limitCount ?? 30));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => d.data() as LokaUserProfile)
    .filter((u) => u.uid !== options.excludeUid);
}

export const serverTime = serverTimestamp;
export type FirestoreDoc = DocumentData;
