import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { Plan } from '@/types/loka';

const plansCollection = collection(db, 'plans');

export async function createPlan(plan: Omit<Plan, 'id' | 'createdAt'>) {
  const ref = await addDoc(plansCollection, {
    ...plan,
    createdAt: Date.now(),
  } satisfies Omit<Plan, 'id'>);
  return ref.id;
}

export async function joinPlan(planId: string, uid: string) {
  await updateDoc(doc(db, 'plans', planId), {
    memberUids: arrayUnion(uid),
  });
}

export function listenToPlansForUser(uid: string, cb: (plans: Plan[]) => void): Unsubscribe {
  const q = query(plansCollection, where('memberUids', 'array-contains', uid));
  return onSnapshot(q, (snapshot) => {
    cb(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Plan, 'id'>) })));
  });
}
