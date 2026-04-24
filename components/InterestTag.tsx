import { Text, View } from 'react-native';

export function InterestTag(props: { label: string; selected?: boolean }) {
  const selected = props.selected ?? false;
  return (
    <View
      className={
        selected
          ? 'rounded-full bg-brand-teal/15 px-3 py-1'
          : 'rounded-full bg-black/5 px-3 py-1'
      }>
      <Text className={selected ? 'text-brand-teal text-xs font-semibold' : 'text-xs text-black/70'}>
        {props.label}
      </Text>
    </View>
  );
}
