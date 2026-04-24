import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { ProfileCard } from '@/components/ProfileCard';
import { getDiscoverUsers } from '@/lib/firestore';
import { likeUser } from '@/lib/matches';
import { computeMatchPercent } from '@/lib/matching';
import { useAuthStore } from '@/stores/useAuthStore';
import type { LokaUserProfile } from '@/types/loka';

type Mode = 'locals' | 'travelers';

export default function DiscoverScreen() {
  const { profile } = useAuthStore();
  const [mode, setMode] = useState<Mode>('locals');
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<LokaUserProfile[]>([]);
  const [cursor, setCursor] = useState(0);

  const current = candidates[cursor];
  const next = candidates[cursor + 1];

  const matchPercent = useMemo(() => {
    if (!profile || !current) return undefined;
    return computeMatchPercent(profile, current);
  }, [profile, current]);

  useEffect(() => {
    (async () => {
      if (!profile) return;
      try {
        setLoading(true);
        const users = await getDiscoverUsers({ excludeUid: profile.uid, limitCount: 50 });
        const filtered = users
          .filter((u) => u.onboardingCompleted)
          .filter((u) => {
            if (mode === 'locals') return u.role === 'local' || u.role === 'both';
            return u.role === 'traveler' || u.role === 'both';
          });
        setCandidates(filtered);
        setCursor(0);
      } catch (e) {
        Alert.alert('Discover failed', e instanceof Error ? e.message : 'Could not load users');
      } finally {
        setLoading(false);
      }
    })();
  }, [profile, mode]);

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  function advance() {
    translateX.value = 0;
    translateY.value = 0;
    setCursor((c) => c + 1);
  }

  async function handleLike() {
    if (!profile || !current) return;

    const percent = computeMatchPercent(profile, current);
    const result = await likeUser({ from: profile, to: current, matchPercent: percent });
    if (result.matched) {
      Alert.alert('It\'s a match!', `You and ${current.name} can start chatting now.`);
    }
  }

  function onDecision(decision: 'like' | 'skip') {
    if (decision === 'like') {
      void handleLike();
    }

    advance();
  }

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd(() => {
      const threshold = 120;
      if (translateX.value > threshold) {
        translateX.value = withSpring(500);
        runOnJS(onDecision)('like');
      } else if (translateX.value < -threshold) {
        translateX.value = withSpring(-500);
        runOnJS(onDecision)('skip');
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(translateX.value, [-250, 0, 250], [-12, 0, 12]);
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateZ: `${rotate}deg` },
      ],
    };
  });

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="px-4 pt-4">
        <Text className="text-2xl font-extrabold text-black">Discover</Text>
        <Text className="mt-1 text-sm text-black/60">
          Swipe to match with locals and travelers.
        </Text>

        <View className="mt-4 flex-row rounded-full bg-black/5 p-1">
          <Pressable
            onPress={() => setMode('locals')}
            className={
              mode === 'locals'
                ? 'flex-1 items-center rounded-full bg-white py-3'
                : 'flex-1 items-center rounded-full py-3'
            }>
            <Text className={mode === 'locals' ? 'font-bold text-black' : 'font-semibold text-black/60'}>
              Find Locals
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setMode('travelers')}
            className={
              mode === 'travelers'
                ? 'flex-1 items-center rounded-full bg-white py-3'
                : 'flex-1 items-center rounded-full py-3'
            }>
            <Text className={mode === 'travelers' ? 'font-bold text-black' : 'font-semibold text-black/60'}>
              Find Travelers
            </Text>
          </Pressable>
        </View>
      </View>

      <View className="flex-1 items-center justify-center px-4 pb-10">
        {!profile ? (
          <Text className="text-black/60">Loading profile…</Text>
        ) : loading ? (
          <Text className="text-black/60">Loading people…</Text>
        ) : !current ? (
          <View className="items-center gap-2">
            <Text className="text-base font-semibold text-black">No more profiles</Text>
            <Text className="text-sm text-black/60">
              Create another account on a second device (or web) to start matching.
            </Text>
          </View>
        ) : (
          <View className="w-full max-w-[420px]">
            {next ? (
              <View className="absolute inset-0 scale-[0.98] opacity-80">
                <ProfileCard profile={next} matchPercent={profile ? computeMatchPercent(profile, next) : undefined} />
              </View>
            ) : null}

            <GestureDetector gesture={pan}>
              <Animated.View style={cardStyle}>
                <ProfileCard profile={current} matchPercent={matchPercent} />
              </Animated.View>
            </GestureDetector>

            <View className="mt-6 flex-row justify-center gap-4">
              <Pressable
                onPress={() => onDecision('skip')}
                className="h-14 w-14 items-center justify-center rounded-full bg-black/5">
                <Text className="text-lg font-extrabold text-black/60">×</Text>
              </Pressable>
              <Pressable
                onPress={() => onDecision('like')}
                className="h-14 w-14 items-center justify-center rounded-full bg-brand-teal">
                <Text className="text-lg font-extrabold text-white">♥</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
