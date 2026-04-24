import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    SafeAreaView,
    Text,
    TextInput,
    View,
} from 'react-native';

import { ChatBubble } from '@/components/ChatBubble';
import { db } from '@/lib/firebase';
import type { MatchDoc } from '@/lib/matches';
import { listenToRoomMessages, sendMessage, updateMatchLastMessage, type MessageDoc } from '@/lib/messages';
import { createPlan } from '@/lib/plans';
import { useAuthStore } from '@/stores/useAuthStore';

function formatISODate(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function ChatScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { profile } = useAuthStore();

  const [text, setText] = useState('');
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [match, setMatch] = useState<MatchDoc | null>(null);

  const otherName = useMemo(() => {
    if (!profile || !match) return 'Chat';
    const otherUid = match.participantUids.find((u) => u !== profile.uid);
    return otherUid ? match.participantInfo[otherUid]?.name ?? 'Chat' : 'Chat';
  }, [match, profile]);

  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: otherName });
  }, [navigation, otherName]);

  useEffect(() => {
    if (!chatId) return;
    return listenToRoomMessages('match', String(chatId), setMessages);
  }, [chatId]);

  useEffect(() => {
    (async () => {
      if (!chatId) return;
      const snap = await getDoc(doc(db, 'matches', String(chatId)));
      setMatch(snap.exists() ? (snap.data() as MatchDoc) : null);
    })();
  }, [chatId]);

  async function onSend(messageText?: string) {
    if (!profile || !chatId) return;

    const finalText = (messageText ?? text).trim();
    if (!finalText) return;

    setText('');
    await sendMessage({
      roomId: String(chatId),
      roomType: 'match',
      senderUid: profile.uid,
      text: finalText,
    });

    await updateMatchLastMessage(String(chatId), finalText);
  }

  async function onSuggestPlan() {
    if (!profile || !match) return;
    const otherUid = match.participantUids.find((u) => u !== profile.uid);
    const other = otherUid ? match.participantInfo[otherUid] : undefined;

    const planId = await createPlan({
      title: other ? `${other.name} + ${profile.name}` : 'New plan',
      createdBy: profile.uid,
      memberUids: otherUid ? [profile.uid, otherUid] : [profile.uid],
      locationText: profile.locationText,
      startTime: undefined,
    });

    router.push({ pathname: '/plan/[planId]', params: { planId } });
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        className="flex-1">
        <FlatList
          data={messages}
          keyExtractor={(m) => m.id ?? `${m.senderUid}-${m.createdAt}`}
          contentContainerClassName="gap-3 px-4 pb-4 pt-4"
          renderItem={({ item }) => (
            <ChatBubble
              text={item.text}
              mine={item.senderUid === profile?.uid}
              timestampText={new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            />
          )}
        />

        <View className="border-t border-black/5 px-4 py-3">
          <View className="mb-3 flex-row gap-2">
            <Pressable
              onPress={() => void onSuggestPlan()}
              className="rounded-full bg-brand-yellow/30 px-4 py-2">
              <Text className="text-xs font-bold text-black">Suggest Plan</Text>
            </Pressable>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className="rounded-full bg-black/5 px-4 py-2">
              <Text className="text-xs font-bold text-black">Pick Date</Text>
            </Pressable>
            <Pressable
              onPress={() => setText((t) => (t ? t : 'Location: '))}
              className="rounded-full bg-black/5 px-4 py-2">
              <Text className="text-xs font-bold text-black">Save Location</Text>
            </Pressable>
          </View>

          <View className="flex-row items-end gap-2">
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Message…"
              multiline
              className="flex-1 rounded-2xl bg-black/5 px-4 py-3"
            />
            <Pressable onPress={() => void onSend()} className="rounded-2xl bg-brand-teal px-4 py-3">
              <Text className="font-bold text-white">Send</Text>
            </Pressable>
          </View>

          {showDatePicker ? (
            <DateTimePicker
              value={new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (!date) return;
                void onSend(`Proposed date: ${formatISODate(date)}`);
              }}
            />
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
