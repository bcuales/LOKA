import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
    Alert,
    Image,
    Platform,
    Pressable,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';

import { INTEREST_TAGS, TRAVEL_STYLES, TRIP_INTENTS, USER_ROLES } from '@/constants/lokaOptions';
import { upsertUserProfile } from '@/lib/firestore';
import { useAuthStore } from '@/stores/useAuthStore';
import type { InterestTag, LokaUserProfile, TravelStyle, TripIntent, UserRole } from '@/types/loka';

function formatISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { firebaseUser, profile, setProfile } = useAuthStore();

  const initialName = profile?.name ?? firebaseUser?.displayName ?? '';
  const initialPhoto = profile?.photoURL ?? firebaseUser?.photoURL ?? undefined;

  const [name, setName] = useState(initialName);
  const [ageText, setAgeText] = useState(profile?.age ? String(profile.age) : '');
  const [photoURL, setPhotoURL] = useState<string | undefined>(initialPhoto);
  const [role, setRole] = useState<UserRole>(profile?.role ?? 'traveler');
  const [bio, setBio] = useState(profile?.bio ?? '');

  const [selectedInterests, setSelectedInterests] = useState<InterestTag[]>(profile?.interests ?? []);
  const [travelStyle, setTravelStyle] = useState<TravelStyle>(profile?.travelStyle ?? 'chill');
  const [tripIntent, setTripIntent] = useState<TripIntent>(profile?.tripIntent ?? 'explore');
  const [languagesText, setLanguagesText] = useState((profile?.languages ?? []).join(', '));
  const [locationText, setLocationText] = useState(profile?.locationText ?? '');

  const [startDate, setStartDate] = useState<Date | null>(
    profile?.travelStartDate ? new Date(profile.travelStartDate) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    profile?.travelEndDate ? new Date(profile.travelEndDate) : null
  );

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(() => {
    return Boolean(firebaseUser?.uid && name.trim() && locationText.trim() && selectedInterests.length);
  }, [firebaseUser?.uid, name, locationText, selectedInterests.length]);

  async function pickPhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Please allow photo access to pick a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled) return;
    setPhotoURL(result.assets[0]?.uri);
  }

  function toggleInterest(tag: InterestTag) {
    setSelectedInterests((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  async function onSave() {
    if (!firebaseUser) return;
    if (!canSave) {
      Alert.alert('Missing info', 'Please add name, location, and at least one interest.');
      return;
    }

    const age = ageText.trim() ? Number(ageText) : undefined;
    const languages = languagesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const now = Date.now();

    const nextProfile: LokaUserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: name.trim(),
      age: Number.isFinite(age) ? age : undefined,
      photoURL,
      role,
      bio: bio.trim() || undefined,
      interests: selectedInterests,
      travelStyle,
      tripIntent,
      languages,
      locationText: locationText.trim(),
      travelStartDate: startDate ? formatISODate(startDate) : undefined,
      travelEndDate: endDate ? formatISODate(endDate) : undefined,
      onboardingCompleted: true,
      createdAt: profile?.createdAt ?? now,
      updatedAt: now,
    };

    try {
      setSaving(true);
      await upsertUserProfile(nextProfile);
      setProfile(nextProfile);
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('Save failed', e instanceof Error ? e.message : 'Could not save profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerClassName="px-6 pb-16">
        <Text className="pt-6 text-2xl font-extrabold text-black">Onboarding</Text>
        <Text className="mt-2 text-base text-black/60">
          This helps Loka match you with the right people.
        </Text>

        <View className="mt-8">
          <Text className="text-xs font-semibold text-black/70">Profile photo</Text>
          <View className="mt-3 flex-row items-center gap-4">
            <View className="h-16 w-16 overflow-hidden rounded-full bg-black/5">
              {photoURL ? <Image source={{ uri: photoURL }} className="h-full w-full" /> : null}
            </View>
            <Pressable onPress={pickPhoto} className="rounded-2xl bg-black px-4 py-3">
              <Text className="font-bold text-white">Choose</Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-8 gap-3">
          <Text className="text-xs font-semibold text-black/70">Name</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Your name" className="rounded-2xl bg-black/5 px-4 py-4" />

          <Text className="mt-3 text-xs font-semibold text-black/70">Age (optional)</Text>
          <TextInput
            value={ageText}
            onChangeText={setAgeText}
            keyboardType="number-pad"
            placeholder="21"
            className="rounded-2xl bg-black/5 px-4 py-4"
          />

          <Text className="mt-3 text-xs font-semibold text-black/70">Role</Text>
          <View className="flex-row flex-wrap gap-2">
            {USER_ROLES.map((r) => (
              <Pressable
                key={r.key}
                onPress={() => setRole(r.key as UserRole)}
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

          <Text className="mt-3 text-xs font-semibold text-black/70">Bio (optional)</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            placeholder="Short bio"
            multiline
            className="min-h-[90px] rounded-2xl bg-black/5 px-4 py-4"
          />
        </View>

        <View className="mt-8">
          <Text className="text-xs font-semibold text-black/70">Interests</Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {INTEREST_TAGS.map((t) => {
              const selected = selectedInterests.includes(t.key);
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

        <View className="mt-8">
          <Text className="text-xs font-semibold text-black/70">Travel style</Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {TRAVEL_STYLES.map((s) => (
              <Pressable
                key={s.key}
                onPress={() => setTravelStyle(s.key)}
                className={
                  travelStyle === s.key
                    ? 'rounded-full bg-brand-teal/15 px-4 py-2'
                    : 'rounded-full bg-black/5 px-4 py-2'
                }>
                <Text className={travelStyle === s.key ? 'font-bold text-brand-teal' : 'font-semibold text-black/70'}>
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-8">
          <Text className="text-xs font-semibold text-black/70">Trip intent</Text>
          <View className="mt-3 flex-row flex-wrap gap-2">
            {TRIP_INTENTS.map((i) => (
              <Pressable
                key={i.key}
                onPress={() => setTripIntent(i.key)}
                className={
                  tripIntent === i.key
                    ? 'rounded-full bg-brand-teal/15 px-4 py-2'
                    : 'rounded-full bg-black/5 px-4 py-2'
                }>
                <Text className={tripIntent === i.key ? 'font-bold text-brand-teal' : 'font-semibold text-black/70'}>
                  {i.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="mt-8 gap-3">
          <Text className="text-xs font-semibold text-black/70">Languages</Text>
          <TextInput
            value={languagesText}
            onChangeText={setLanguagesText}
            placeholder="English, Filipino"
            className="rounded-2xl bg-black/5 px-4 py-4"
          />

          <Text className="mt-3 text-xs font-semibold text-black/70">Location</Text>
          <TextInput
            value={locationText}
            onChangeText={setLocationText}
            placeholder="City, Country"
            className="rounded-2xl bg-black/5 px-4 py-4"
          />
        </View>

        <View className="mt-8">
          <Text className="text-xs font-semibold text-black/70">Travel dates</Text>
          <View className="mt-3 flex-row gap-3">
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
          disabled={!canSave || saving}
          onPress={onSave}
          className={
            !canSave || saving
              ? 'mt-10 items-center rounded-2xl bg-brand-teal/50 py-4'
              : 'mt-10 items-center rounded-2xl bg-brand-teal py-4'
          }>
          <Text className="text-base font-bold text-white">
            {saving ? 'Saving…' : 'Finish'}
          </Text>
        </Pressable>

        <Text className="mt-4 text-xs text-black/40">
          Note: profile photos are stored as local URIs in this MVP. For production, upload to Firebase
          Storage and save the public URL.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
