import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';

import { PlanCard } from '@/components/PlanCard';
import { createPlan, listenToPlansForUser } from '@/lib/plans';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Plan } from '@/types/loka';

export default function PlansScreen() {
  const router = useRouter();
  const { profile } = useAuthStore();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [title, setTitle] = useState('');
  const [locationText, setLocationText] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!profile) return;
    return listenToPlansForUser(profile.uid, setPlans);
  }, [profile]);

  const canCreate = useMemo(() => Boolean(profile && title.trim()), [profile, title]);

  async function onCreate() {
    if (!profile) return;
    if (!canCreate) return;

    try {
      setCreating(true);
      const planId = await createPlan({
        title: title.trim(),
        locationText: locationText.trim() || undefined,
        startTime: undefined,
        createdBy: profile.uid,
        memberUids: [profile.uid],
      });
      setTitle('');
      setLocationText('');
      router.push({ pathname: '/plan/[planId]', params: { planId } });
    } catch (e) {
      Alert.alert('Create failed', e instanceof Error ? e.message : 'Could not create plan');
    } finally {
      setCreating(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerClassName="px-4 pb-10">
        <View className="flex-row items-center justify-between pt-4">
          <Text className="text-2xl font-extrabold text-black">Plans</Text>
          <Pressable onPress={() => router.back()} className="rounded-full bg-black/5 px-4 py-2">
            <Text className="text-sm font-bold text-black">Back</Text>
          </Pressable>
        </View>

        <Text className="mt-1 text-sm text-black/60">Create group activities and chat inside.</Text>

        <View className="mt-6 rounded-3xl bg-black/5 p-4">
          <Text className="text-xs font-semibold text-black/70">Create a plan</Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., BGC bar hop tonight"
            className="mt-3 rounded-2xl bg-white px-4 py-4"
          />

          <TextInput
            value={locationText}
            onChangeText={setLocationText}
            placeholder="Location (optional)"
            className="mt-3 rounded-2xl bg-white px-4 py-4"
          />

          <Pressable
            disabled={!canCreate || creating}
            onPress={() => void onCreate()}
            className={
              !canCreate || creating
                ? 'mt-3 items-center rounded-2xl bg-brand-teal/50 py-4'
                : 'mt-3 items-center rounded-2xl bg-brand-teal py-4'
            }>
            <Text className="text-base font-bold text-white">{creating ? 'Creating…' : 'Create'}</Text>
          </Pressable>
        </View>

        <View className="mt-8 gap-3">
          <Text className="text-xs font-semibold text-black/70">Your plans</Text>
          {plans.length === 0 ? (
            <Text className="text-sm text-black/60">No plans yet.</Text>
          ) : (
            plans.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => router.push({ pathname: '/plan/[planId]', params: { planId: p.id } })}
                className="active:opacity-80">
                <PlanCard title={p.title} locationText={p.locationText} memberCount={p.memberUids.length} />
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
