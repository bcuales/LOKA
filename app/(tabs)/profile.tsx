import DateTimePicker from '@react-native-community/datetimepicker';
import { useMemo, useState } from 'react';
import {
    Alert,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';

import { INTEREST_TAGS, USER_ROLES } from '@/constants/lokaOptions';
import { signOut } from '@/lib/auth';
import { upsertUserProfile } from '@/lib/firestore';
import { useAuthStore } from '@/stores/useAuthStore';
import type { InterestTag, UserRole } from '@/types/loka';

function formatISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function ProfileScreen() {
  const { profile, setProfile } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const [bio, setBio] = useState(profile?.bio ?? '');
  const [role, setRole] = useState<UserRole>(profile?.role ?? 'traveler');
  const [interests, setInterests] = useState<InterestTag[]>(profile?.interests ?? []);

  const [startDate, setStartDate] = useState<Date | null>(
    profile?.travelStartDate ? new Date(profile.travelStartDate) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    profile?.travelEndDate ? new Date(profile.travelEndDate) : null
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const dirty = useMemo(() => {
    if (!profile) return false;
    const a = (profile.interests ?? []).slice().sort().join(',');
    const b = interests.slice().sort().join(',');
    return (
      (profile.bio ?? '') !== bio ||
      profile.role !== role ||
      a !== b ||
      (profile.travelStartDate ?? '') !== (startDate ? formatISODate(startDate) : '') ||
      (profile.travelEndDate ?? '') !== (endDate ? formatISODate(endDate) : '')
    );
  }, [bio, endDate, interests, profile, role, startDate]);

  function toggleInterest(tag: InterestTag) {
    setInterests((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function onSave() {
    if (!profile) return;
    try {
      setSaving(true);
      const next = {
        ...profile,
        bio: bio.trim() || undefined,
        role,
        interests,
        travelStartDate: startDate ? formatISODate(startDate) : undefined,
        travelEndDate: endDate ? formatISODate(endDate) : undefined,
        updatedAt: Date.now(),
      };
      await upsertUserProfile(next);
      setProfile(next);
      Alert.alert('Saved', 'Profile updated.');
    } catch (e) {
      Alert.alert('Save failed', e instanceof Error ? e.message : 'Could not update profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerClassName="px-4 pb-10">
        <View className="flex-row items-center justify-between pt-4">
          <Text className="text-2xl font-extrabold text-black">Profile</Text>
          <View className="rounded-full bg-brand-yellow/30 px-3 py-1">
            <Text className="text-xs font-bold text-black">Verified</Text>
          </View>
        </View>

        {!profile ? (
          <Text className="mt-6 text-sm text-black/60">Loading…</Text>
        ) : (
          <>
            <Text className="mt-2 text-sm text-black/60">{profile.name}</Text>

            <View className="mt-6">
              <Text className="text-xs font-semibold text-black/70">Role</Text>
              <View className="mt-2 flex-row flex-wrap gap-2">
                {USER_ROLES.map((r) => (
                  <Pressable
                    key={r.key}
                    onPress={() => setRole(r.key)}
                    className={
                      role === r.key
                        ? 'rounded-full bg-brand-teal/15 px-4 py-2'
                        : 'rounded-full bg-black/5 px-4 py-2'
                    }>
                    <Text className={role === r.key ? 'font-bold text-brand-teal' : 'font-semibold text-black/70'}>
                      {r.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="mt-6">
              <Text className="text-xs font-semibold text-black/70">Bio</Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Tell people what you’re down for"
                multiline
                className="mt-2 min-h-[90px] rounded-2xl bg-black/5 px-4 py-4"
              />
            </View>

            <View className="mt-6">
              <Text className="text-xs font-semibold text-black/70">Interests</Text>
              <View className="mt-2 flex-row flex-wrap gap-2">
                {INTEREST_TAGS.map((t) => {
                  const selected = interests.includes(t.key);
                  return (
                    <Pressable
                      key={t.key}
                      onPress={() => toggleInterest(t.key)}
                      className={
                        selected
                          ? 'rounded-full bg-brand-teal/15 px-4 py-2'
                          : 'rounded-full bg-black/5 px-4 py-2'
                      }>
                      <Text className={selected ? 'font-bold text-brand-teal' : 'font-semibold text-black/70'}>
                        {t.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="mt-6">
              <Text className="text-xs font-semibold text-black/70">Travel dates</Text>
              <View className="mt-2 flex-row gap-3">
                <Pressable
                  onPress={() => setShowStartPicker(true)}
                  className="flex-1 rounded-2xl bg-black/5 px-4 py-4">
                  <Text className="text-sm text-black/70">
                    {startDate ? formatISODate(startDate) : 'Start'}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setShowEndPicker(true)}
                  className="flex-1 rounded-2xl bg-black/5 px-4 py-4">
                  <Text className="text-sm text-black/70">
                    {endDate ? formatISODate(endDate) : 'End'}
                  </Text>
                </Pressable>
              </View>

              {showStartPicker ? (
                <DateTimePicker
                  value={startDate ?? new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(_, date) => {
                    setShowStartPicker(false);
                    if (date) setStartDate(date);
                  }}
                />
              ) : null}

              {showEndPicker ? (
                <DateTimePicker
                  value={endDate ?? startDate ?? new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(_, date) => {
                    setShowEndPicker(false);
                    if (date) setEndDate(date);
                  }}
                />
              ) : null}
            </View>

            <Pressable
              disabled={!dirty || saving}
              onPress={onSave}
              className={
                !dirty || saving
                  ? 'mt-8 items-center rounded-2xl bg-brand-teal/50 py-4'
                  : 'mt-8 items-center rounded-2xl bg-brand-teal py-4'
              }>
              <Text className="text-base font-bold text-white">{saving ? 'Saving…' : 'Save changes'}</Text>
            </Pressable>

            <Pressable
              onPress={() => void signOut()}
              className="mt-4 items-center rounded-2xl bg-black/5 py-4">
              <Text className="text-base font-bold text-black">Sign out</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
