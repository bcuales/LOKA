import { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';

import { InterestTag } from '@/components/InterestTag';
import { ProfileCard } from '@/components/ProfileCard';
import { INTEREST_TAGS, TRAVEL_STYLES } from '@/constants/lokaOptions';
import { getDiscoverUsers } from '@/lib/firestore';
import { computeMatchPercent } from '@/lib/matching';
import { useAuthStore } from '@/stores/useAuthStore';
import type { InterestTag as InterestKey, LokaUserProfile, TravelStyle } from '@/types/loka';

function overlaps(aStart?: string, aEnd?: string, bStart?: string, bEnd?: string) {
  if (!aStart || !aEnd || !bStart || !bEnd) return true;
  const as = new Date(aStart).getTime();
  const ae = new Date(aEnd).getTime();
  const bs = new Date(bStart).getTime();
  const be = new Date(bEnd).getTime();
  if ([as, ae, bs, be].some((t) => Number.isNaN(t))) return true;
  return Math.min(ae, be) >= Math.max(as, bs);
}

export default function ExploreScreen() {
  const { profile } = useAuthStore();
  const [all, setAll] = useState<LokaUserProfile[]>([]);

  const [interest, setInterest] = useState<InterestKey | null>(null);
  const [style, setStyle] = useState<TravelStyle | null>(null);
  const [availabilityOnly, setAvailabilityOnly] = useState(true);

  useEffect(() => {
    (async () => {
      if (!profile) return;
      const users = await getDiscoverUsers({ excludeUid: profile.uid, limitCount: 60 });
      setAll(users.filter((u) => u.onboardingCompleted));
    })();
  }, [profile]);

  const filtered = useMemo(() => {
    if (!profile) return [];
    return all
      .filter((u) => (interest ? u.interests.includes(interest) : true))
      .filter((u) => (style ? u.travelStyle === style : true))
      .filter((u) =>
        availabilityOnly
          ? overlaps(profile.travelStartDate, profile.travelEndDate, u.travelStartDate, u.travelEndDate)
          : true
      );
  }, [all, availabilityOnly, interest, profile, style]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerClassName="px-4 pb-10">
        <Text className="pt-4 text-2xl font-extrabold text-black">Explore</Text>
        <Text className="mt-1 text-sm text-black/60">Browse without swiping.</Text>

        <View className="mt-6 gap-3">
          <Text className="text-xs font-semibold text-black/70">Filters</Text>

          <View className="flex-row flex-wrap gap-2">
            <Pressable onPress={() => setAvailabilityOnly((v) => !v)}>
              <InterestTag label={availabilityOnly ? 'Availability: On' : 'Availability: Off'} selected={availabilityOnly} />
            </Pressable>

            <Pressable onPress={() => setInterest(null)}>
              <InterestTag label={interest ? 'Clear interest' : 'Interest'} selected={Boolean(interest)} />
            </Pressable>

            <Pressable onPress={() => setStyle(null)}>
              <InterestTag label={style ? 'Clear style' : 'Style'} selected={Boolean(style)} />
            </Pressable>
          </View>

          <View className="mt-2">
            <Text className="text-xs font-semibold text-black/70">Interests</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2">
              <View className="flex-row gap-2 pr-4">
                {INTEREST_TAGS.map((t) => (
                  <Pressable key={t.key} onPress={() => setInterest(t.key)}>
                    <InterestTag label={t.label} selected={interest === t.key} />
                  </Pressable>
                ))}
              </View>
            </ScrollView>
          </View>

          <View className="mt-4">
            <Text className="text-xs font-semibold text-black/70">Travel style</Text>
            <View className="mt-2 flex-row flex-wrap gap-2">
              {TRAVEL_STYLES.map((s) => (
                <Pressable key={s.key} onPress={() => setStyle(s.key)}>
                  <InterestTag label={s.label} selected={style === s.key} />
                </Pressable>
              ))}
            </View>
          </View>
        </View>

        <View className="mt-8 gap-4">
          <Text className="text-xs font-semibold text-black/70">Near you / trending</Text>
          {filtered.length === 0 ? (
            <Text className="text-sm text-black/60">No profiles match your filters.</Text>
          ) : (
            filtered.map((u) => (
              <View key={u.uid} className="rounded-3xl bg-white">
                <ProfileCard profile={u} matchPercent={profile ? computeMatchPercent(profile, u) : undefined} />
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
