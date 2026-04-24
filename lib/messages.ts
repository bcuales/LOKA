import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  doc,
  type Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';

export type RoomType = 'match' | 'plan';

export type MessageDoc = {
  id?: string;
  senderUid: string;
  text: string;
  createdAt: number;
};

function roomMessagesCollection(roomType: RoomType, roomId: string) {
  return collection(db, roomType === 'match' ? 'matches' : 'plans', roomId, 'messages');
}

export async function sendMessage(params: {
  roomType: RoomType;
  roomId: string;
  senderUid: string;
  text: string;
}) {
  await addDoc(roomMessagesCollection(params.roomType, params.roomId), {
    senderUid: params.senderUid,
    text: params.text,
    createdAt: Date.now(),
  } satisfies Omit<MessageDoc, 'id'>);
}

export function listenToRoomMessages(
  roomType: RoomType,
  roomId: string,
  cb: (messages: MessageDoc[]) => void
): Unsubscribe {
  const q = query(roomMessagesCollection(roomType, roomId), orderBy('createdAt', 'asc'));

  return onSnapshot(q, (snapshot) => {
    cb(snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as MessageDoc) })));
  });
}

export async function updateMatchLastMessage(matchId: string, text: string) {
  await updateDoc(doc(db, 'matches', matchId), {
    lastMessageText: text,
    lastMessageAt: Date.now(),
  });
}
