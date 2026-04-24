import { Text, View } from 'react-native';

export function PlanCard(props: {
  title: string;
  locationText?: string;
  memberCount: number;
}) {
  return (
    <View className="rounded-2xl bg-white p-4">
      <Text className="text-base font-bold text-black">{props.title}</Text>
      {props.locationText ? (
        <Text className="mt-1 text-xs text-black/60">{props.locationText}</Text>
      ) : null}
      <Text className="mt-2 text-xs font-semibold text-brand-teal">
        {props.memberCount} going
      </Text>
    </View>
  );
}
