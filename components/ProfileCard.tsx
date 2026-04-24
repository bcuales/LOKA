import { InterestTag } from '@/components/InterestTag';
import { INTEREST_TAGS } from '@/constants/lokaOptions';
import type { LokaUserProfile } from '@/types/loka';
import { Image, Text, View } from 'react-native';

function labelForInterest(key: string) {
  return INTEREST_TAGS.find((t) => t.key === key)?.label ?? key;
}

export function ProfileCard(props: {
  profile: LokaUserProfile;
  matchPercent?: number;
}) {
  const { profile, matchPercent } = props;

  return (
    <View className="overflow-hidden rounded-3xl bg-white">
      <View className="h-96 w-full bg-black/5">
        {profile.photoURL ? (
          <Image
            source={{ uri: profile.photoURL }}
            resizeMode="cover"
            className="h-full w-full"
          />
        ) : (
          <View className="h-full w-full items-center justify-center">
            <Text className="text-black/40">No photo</Text>
          </View>
        )}
      </View>

      <View className="gap-3 p-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-black">
            {profile.name}
            {profile.age ? `, ${profile.age}` : ''}
          </Text>
          {typeof matchPercent === 'number' ? (
            <View className="rounded-full bg-brand-yellow/30 px-3 py-1">
              <Text className="text-xs font-bold text-black">
                {matchPercent}% match
              </Text>
            </View>
          ) : null}
        </View>

        {profile.bio ? (
          <Text className="text-sm leading-5 text-black/70">{profile.bio}</Text>
        ) : null}

        <View className="flex-row flex-wrap gap-2">
          {profile.interests.slice(0, 6).map((t) => (
            <InterestTag key={t} label={labelForInterest(t)} />
          ))}
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-xs text-black/60">
            {profile.locationText}
          </Text>
          <Text className="text-xs font-semibold text-brand-teal">
            {profile.role.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );
}
