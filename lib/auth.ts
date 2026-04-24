import { auth } from '@/lib/firebase';
import {
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    signInWithCredential,
    signInWithEmailAndPassword,
    type UserCredential,
} from 'firebase/auth';

export async function signInWithEmail(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
}

export async function signUpWithEmail(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogleIdToken(idToken: string): Promise<UserCredential> {
    const credential = GoogleAuthProvider.credential(idToken);
    return signInWithCredential(auth, credential);
}

export async function signOut() {
    return firebaseSignOut(auth);
}
