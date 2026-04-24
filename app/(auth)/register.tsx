import { Link } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { signUpWithEmail } from '@/lib/auth';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onRegister() {
    try {
      setError(null);
      setLoading(true);
      await signUpWithEmail(email.trim(), password);
      // Auth gate in app/_layout will route to onboarding.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-10">
        <Text className="text-2xl font-extrabold text-black">Create account</Text>
        <Text className="mt-2 text-base text-black/60">
          You’re one step away from your next travel crew.
        </Text>

        <View className="mt-10 gap-3">
          <Text className="text-xs font-semibold text-black/70">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@example.com"
            className="rounded-2xl bg-black/5 px-4 py-4"
          />

          <Text className="mt-3 text-xs font-semibold text-black/70">Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="At least 6 characters"
            className="rounded-2xl bg-black/5 px-4 py-4"
          />

          {error ? <Text className="mt-2 text-sm text-red-600">{error}</Text> : null}

          <Pressable
            disabled={loading}
            onPress={onRegister}
            className={
              loading
                ? 'mt-4 items-center rounded-2xl bg-brand-teal/60 py-4'
                : 'mt-4 items-center rounded-2xl bg-brand-teal py-4'
            }>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-base font-bold text-white">Create</Text>
            )}
          </Pressable>

          <View className="mt-8 flex-row justify-center gap-2">
            <Text className="text-sm text-black/60">Already have an account?</Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text className="text-sm font-bold text-brand-teal">Sign in</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
