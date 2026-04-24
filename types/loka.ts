export type UserRole = 'traveler' | 'local' | 'both';

export type TravelStyle = 'budget' | 'luxury' | 'chill' | 'spontaneous';

export type TripIntent = 'explore' | 'party' | 'content' | 'relax';

export type InterestTag =
    | 'food'
    | 'nightlife'
    | 'culture'
    | 'adventure'
    | 'nature'
    | 'shopping'
    | 'wellness'
    | 'music'
    | 'sports'
    | 'art';

export type LokaUserProfile = {
    uid: string;
    email?: string | null;

    // Onboarding
    name: string;
    age?: number;
    photoURL?: string;
    role: UserRole;
    bio?: string;

    interests: InterestTag[];
    travelStyle: TravelStyle;
    tripIntent: TripIntent;
    languages: string[];

    // Travel context
    locationText: string;
    // ISO dates (YYYY-MM-DD)
    travelStartDate?: string;
    travelEndDate?: string;

    // Derived / flags
    onboardingCompleted: boolean;

    createdAt: number;
    updatedAt: number;
};

export type MatchSummary = {
    id: string;
    otherUid: string;
    otherName: string;
    otherPhotoURL?: string;
    matchPercent: number;
    lastMessageText?: string;
    lastMessageAt?: number;
};

export type ChatMessage = {
    id: string;
    chatId: string;
    senderUid: string;
    text: string;
    createdAt: number;
};

export type Plan = {
    id: string;
    title: string;
    locationText?: string;
    startTime?: number;
    createdBy: string;
    memberUids: string[];
    createdAt: number;
};
