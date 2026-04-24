import {
    collection,
    doc,
    getDoc,
    onSnapshot,
    query,
    setDoc,
    where,
    type Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';
import type { LokaUserProfile } from '@/types/loka';

export type MatchDoc = {
    id: string;
    participantUids: [string, string];
    matchPercent: number;
    createdAt: number;
    participantInfo: Record<string, { name: string; photoURL?: string }>;
    lastMessageText?: string;
    lastMessageAt?: number;
};

type LikeDoc = {
    fromUid: string;
    toUid: string;
    createdAt: number;
};

const likesCollection = collection(db, 'likes');
const matchesCollection = collection(db, 'matches');

export function getMatchId(uidA: string, uidB: string) {
    const [a, b] = [uidA, uidB].sort();
    return `${a}_${b}`;
}

function likeId(fromUid: string, toUid: string) {
    return `${fromUid}_${toUid}`;
}

export async function likeUser(params: {
    from: LokaUserProfile;
    to: LokaUserProfile;
    matchPercent: number;
}) {
    const fromUid = params.from.uid;
    const toUid = params.to.uid;
    const [uidA, uidB] = [fromUid, toUid].sort();

    await setDoc(doc(likesCollection, likeId(fromUid, toUid)), {
        fromUid,
        toUid,
        createdAt: Date.now(),
    } satisfies LikeDoc);

    // If they already liked you, create a match.
    const reverseLike = await getDoc(doc(likesCollection, likeId(toUid, fromUid)));
    if (!reverseLike.exists()) return { matched: false as const };

    const matchId = getMatchId(fromUid, toUid);
    const matchDoc: MatchDoc = {
        id: matchId,
        participantUids: [uidA, uidB],
        matchPercent: params.matchPercent,
        createdAt: Date.now(),
        participantInfo: {
            [fromUid]: {
                name: params.from.name,
                photoURL: params.from.photoURL,
            },
            [toUid]: {
                name: params.to.name,
                photoURL: params.to.photoURL,
            },
        },
    };

    await setDoc(doc(matchesCollection, matchId), matchDoc, { merge: true });
    return { matched: true as const, matchId };
}

export function listenToMatches(uid: string, cb: (docs: MatchDoc[]) => void): Unsubscribe {
    const q = query(matchesCollection, where('participantUids', 'array-contains', uid));
    return onSnapshot(q, (snapshot) => {
        cb(snapshot.docs.map((d) => d.data() as MatchDoc));
    });
}
