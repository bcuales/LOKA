import { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { MatchCard } from '@/components/MatchCard';
import { listenToMatches, type MatchDoc } from '@/lib/matches';
import { useAuthStore } from '@/stores/useAuthStore';

export default function MatchesScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();
  const [matches, setMatches] = useState<MatchDoc[]>([]);

  useEffect(() => {
    if (!profile) return;
    return listenToMatches(profile.uid, setMatches);
  }, [profile]);

  const items = useMemo(() => {
    if (!profile) return [];

    return matches
      .map((m) => {
        const otherUid = m.participantUids.find((u) => u !== profile.uid);
        if (!otherUid) return null;
        const other = m.participantInfo[otherUid];
        return {
          id: m.id,
          otherUid,
          name: other?.name ?? 'Unknown',
          photoURL: other?.photoURL,
          matchPercent: m.matchPercent,
          lastMessageText: m.lastMessageText,
          lastMessageAt: m.lastMessageAt,
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      otherUid: string;
      name: string;
      photoURL?: string;
      matchPercent: number;
      lastMessageText?: string;
      lastMessageAt?: number;
    }>;
  }, [matches, profile]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerClassName="px-4 pb-10">
        <View className="flex-row items-center justify-between pt-4">
          <Text className="text-2xl font-extrabold text-black">Matches</Text>
          <Pressable onPress={() => router.push('/plans')} className="rounded-full bg-brand-yellow/30 px-4 py-2">
            <Text className="text-sm font-bold text-black">Plans</Text>
          </Pressable>
        </View>

        <Text className="mt-1 text-sm text-black/60">Your mutual likes.</Text>

        <View className="mt-6 gap-3">
          {!profile ? (
            <Text className="text-sm text-black/60">Loading…</Text>
          ) : items.length === 0 ? (
            <Text className="text-sm text-black/60">No matches yet. Start swiping!</Text>
          ) : (
            items.map((m) => (
              <Pressable
                key={m.id}
                onPress={() => router.push({ pathname: '/chat/[chatId]', params: { chatId: m.id } })}
                className="active:opacity-80">
                <MatchCard
                  name={m.name}
                  photoURL={m.photoURL}
                  matchPercent={m.matchPercent}
                  lastMessageText={m.lastMessageText}
                />
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
