import type { InterestTag, TravelStyle, TripIntent, UserRole } from '@/types/loka';

export const INTEREST_TAGS: { key: InterestTag; label: string }[] = [
  { key: 'food', label: 'Food' },
  { key: 'nightlife', label: 'Nightlife' },
  { key: 'culture', label: 'Culture' },
  { key: 'adventure', label: 'Adventure' },
  { key: 'nature', label: 'Nature' },
  { key: 'shopping', label: 'Shopping' },
  { key: 'wellness', label: 'Wellness' },
  { key: 'music', label: 'Music' },
  { key: 'sports', label: 'Sports' },
  { key: 'art', label: 'Art' },
];

export const TRAVEL_STYLES: { key: TravelStyle; label: string }[] = [
  { key: 'budget', label: 'Budget' },
  { key: 'luxury', label: 'Luxury' },
  { key: 'chill', label: 'Chill' },
  { key: 'spontaneous', label: 'Spontaneous' },
];

export const TRIP_INTENTS: { key: TripIntent; label: string }[] = [
  { key: 'explore', label: 'Explore' },
  { key: 'party', label: 'Party' },
  { key: 'content', label: 'Content' },
  { key: 'relax', label: 'Relax' },
];

export const USER_ROLES: { key: UserRole; label: string }[] = [
  { key: 'traveler', label: 'Traveler' },
  { key: 'local', label: 'Local' },
  { key: 'both', label: 'Both' },
];
