import { useLocalSearchParams, useNavigation } from 'expo-router';
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
import { listenToRoomMessages, sendMessage, type MessageDoc } from '@/lib/messages';
import { joinPlan } from '@/lib/plans';
import { useAuthStore } from '@/stores/useAuthStore';
import type { Plan } from '@/types/loka';

export default function PlanChatScreen() {
  const navigation = useNavigation();
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const { profile } = useAuthStore();

  const [plan, setPlan] = useState<Plan | null>(null);
  const [messages, setMessages] = useState<MessageDoc[]>([]);
  const [text, setText] = useState('');

  const title = useMemo(() => plan?.title ?? 'Plan', [plan?.title]);

  useEffect(() => {
    navigation.setOptions({ title });
  }, [navigation, title]);

  useEffect(() => {
    if (!planId) return;
    return listenToRoomMessages('plan', String(planId), setMessages);
  }, [planId]);

  useEffect(() => {
    (async () => {
      if (!planId) return;
      const snap = await getDoc(doc(db, 'plans', String(planId)));
      setPlan(snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<Plan, 'id'>) } as Plan) : null);
    })();
  }, [planId]);

  useEffect(() => {
    if (!profile || !planId || !plan) return;
    if (plan.memberUids.includes(profile.uid)) return;
    void joinPlan(String(planId), profile.uid);
  }, [plan, planId, profile]);

  async function onSend() {
    if (!profile || !planId) return;
    const final = text.trim();
    if (!final) return;
    setText('');
    await sendMessage({ roomId: String(planId), roomType: 'plan', senderUid: profile.uid, text: final });
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
          ListHeaderComponent={
            plan ? (
              <View className="mb-2 rounded-2xl bg-black/5 p-3">
                <Text className="text-xs font-semibold text-black/70">Plan</Text>
                <Text className="mt-1 text-base font-bold text-black">{plan.title}</Text>
                {plan.locationText ? (
                  <Text className="mt-1 text-xs text-black/60">{plan.locationText}</Text>
                ) : null}
                <Text className="mt-2 text-xs font-semibold text-brand-teal">
                  {plan.memberUids.length} going
                </Text>
              </View>
            ) : null
          }
        />

        <View className="border-t border-black/5 px-4 py-3">
          <View className="flex-row items-end gap-2">
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Message the group…"
              multiline
              className="flex-1 rounded-2xl bg-black/5 px-4 py-3"
            />
            <Pressable onPress={() => void onSend()} className="rounded-2xl bg-brand-teal px-4 py-3">
              <Text className="font-bold text-white">Send</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
