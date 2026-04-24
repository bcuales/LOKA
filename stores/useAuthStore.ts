import { onAuthStateChanged, type User } from 'firebase/auth';
import { create } from 'zustand';

import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/lib/firestore';
import type { LokaUserProfile } from '@/types/loka';

type AuthState = {
    firebaseUser: User | null;
    profile: LokaUserProfile | null;
    initializing: boolean;
    error?: string;

    init: () => () => void;
    refreshProfile: () => Promise<void>;
    setProfile: (profile: LokaUserProfile | null) => void;
};

let unsubscribeAuth: (() => void) | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
    firebaseUser: null,
    profile: null,
    initializing: true,

    init: () => {
        if (unsubscribeAuth) return unsubscribeAuth;

        unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            set({ firebaseUser: user, initializing: false, error: undefined });
            if (!user) {
                set({ profile: null });
                return;
            }

            try {
                const profile = await getUserProfile(user.uid);
                set({ profile });
            } catch (e) {
                set({ error: e instanceof Error ? e.message : 'Failed to load profile' });
            }
        });

        return unsubscribeAuth;
    },

    refreshProfile: async () => {
        const user = get().firebaseUser;
        if (!user) return;
        const profile = await getUserProfile(user.uid);
        set({ profile });
    },

    setProfile: (profile) => set({ profile }),
}));
