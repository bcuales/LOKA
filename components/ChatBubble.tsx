import { Text, View } from 'react-native';

export function ChatBubble(props: {
  text: string;
  mine?: boolean;
  timestampText?: string;
}) {
  const mine = props.mine ?? false;
  return (
    <View className={mine ? 'items-end' : 'items-start'}>
      <View
        className={
          mine
            ? 'max-w-[80%] rounded-2xl rounded-tr-sm bg-brand-teal px-4 py-2'
            : 'max-w-[80%] rounded-2xl rounded-tl-sm bg-black/5 px-4 py-2'
        }>
        <Text className={mine ? 'text-white' : 'text-black'}>{props.text}</Text>
      </View>
      {props.timestampText ? (
        <Text className="mt-1 text-[10px] text-black/40">{props.timestampText}</Text>
      ) : null}
    </View>
  );
}
