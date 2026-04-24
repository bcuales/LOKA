import { Image, Text, View } from 'react-native';

export function MatchCard(props: {
  name: string;
  photoURL?: string;
  matchPercent: number;
  lastMessageText?: string;
}) {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl bg-white p-3">
      <View className="h-12 w-12 overflow-hidden rounded-full bg-black/5">
        {props.photoURL ? (
          <Image source={{ uri: props.photoURL }} className="h-full w-full" />
        ) : null}
      </View>

      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-bold text-black">{props.name}</Text>
          <Text className="text-xs font-bold text-brand-teal">{props.matchPercent}%</Text>
        </View>
        <Text className="mt-1 text-xs text-black/60" numberOfLines={1}>
          {props.lastMessageText ?? 'Say hi and start planning'}
        </Text>
      </View>
    </View>
  );
}
