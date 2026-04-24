# Loka

Cross-platform social travel app (Expo + React Native + TypeScript) that matches travelers with locals and other travelers, then lets them chat and create group plans.

## Tech
- Expo Router (navigation)
- NativeWind (Tailwind styling)
- Firebase (Auth + Firestore)
- Zustand (client state)

## Getting started

### 1) Install
```bash
npm install
```

### 2) Configure Firebase
1. Create a Firebase project
2. Enable **Authentication** providers:
   - Email/Password
   - Google
3. Create a **Web app** in Firebase (Project Settings → General → Your apps) to get the config keys
4. Copy `.env.example` → `.env` and fill in values

```bash
cp .env.example .env
```

### 3) Run
```bash
npm run start
```
- Press `i` for iOS Simulator
- Press `a` for Android emulator
- Press `w` for web

## App routes
- `/(auth)/login` and `/(auth)/register`
- `/onboarding` (required after first login)
- `/(tabs)`
  - `Discover` (swipe)
  - `Explore` (feed)
  - `Matches` (list + plans entry)
  - `Profile` (edit)
- `/chat/[chatId]` (1:1 chat)
- `/plans` and `/plan/[planId]` (group plans + chat)

## Firestore collections (MVP)

- `users/{uid}`
  - onboarding profile fields

- `likes/{fromUid_toUid}`
  - created on swipe-right

- `matches/{uidA_uidB}`
  - created when two users like each other
  - stores `participantUids`, `participantInfo`, `matchPercent`, and last message preview

- `matches/{matchId}/messages/{autoId}`
  - `senderUid`, `text`, `createdAt`

- `plans/{autoId}`
  - group plan metadata + `memberUids`

- `plans/{planId}/messages/{autoId}`
  - `senderUid`, `text`, `createdAt`

## Notes
- For onboarding photos, this MVP stores a local URI in `photoURL`. For a real deployment, upload images to Firebase Storage and store the public URL.
- Match scoring in `lib/matching.ts` is client-side for MVP and uses lightweight heuristics (shared interests, travel style, date overlap, simple location text similarity).
