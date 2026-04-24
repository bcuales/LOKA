import { Link } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
  Platform,
} from 'react-native';

import { signInWithEmail, signInWithGoogleIdToken } from '@/lib/auth';

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const googleClientIds = useMemo(
    () => ({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    }),
    []
  );

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    ...googleClientIds,
  });

  useEffect(() => {
    (async () => {
      if (response?.type !== 'success') return;
      const idToken = response.authentication?.idToken;
      if (!idToken) return;

      try {
        setError(null);
        setLoading(true);
        await signInWithGoogleIdToken(idToken);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Google sign-in failed');
      } finally {
        setLoading(false);
      }
    })();
  }, [response]);

  async function onEmailLogin() {
    try {
      setError(null);
      setLoading(true);
      await signInWithEmail(email.trim(), password);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  const canGoogle = Boolean(googleClientIds.webClientId);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-10">
        <Text className="text-3xl font-extrabold text-black">Loka</Text>
        <Text className="mt-2 text-base text-black/60">
          Meet locals and travelers that match your vibe.
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
            placeholder="••••••••"
            className="rounded-2xl bg-black/5 px-4 py-4"
          />

          {error ? <Text className="mt-2 text-sm text-red-600">{error}</Text> : null}

          <Pressable
            disabled={loading}
            onPress={onEmailLogin}
            className={
              loading
                ? 'mt-4 items-center rounded-2xl bg-brand-teal/60 py-4'
                : 'mt-4 items-center rounded-2xl bg-brand-teal py-4'
            }>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-base font-bold text-white">Continue</Text>
            )}
          </Pressable>

          <View className="my-4 items-center">
            <Text className="text-xs text-black/40">or</Text>
          </View>

          <Pressable
            disabled={!request || loading || !canGoogle}
            onPress={() =>
              promptAsync({
                // For Expo Go, the proxy is the simplest path.
                // In a production build you can remove this.
                useProxy: Platform.OS !== 'web',
              })
            }
            className={
              !canGoogle
                ? 'items-center rounded-2xl bg-black/10 py-4'
                : 'items-center rounded-2xl bg-black py-4'
            }>
            <Text className={!canGoogle ? 'text-base font-bold text-black/40' : 'text-base font-bold text-white'}>
              Continue with Google
            </Text>
          </Pressable>

          {!canGoogle ? (
            <Text className="mt-2 text-xs text-black/50">
              Set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in `.env` to enable Google login.
            </Text>
          ) : null}

          <View className="mt-8 flex-row justify-center gap-2">
            <Text className="text-sm text-black/60">New here?</Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text className="text-sm font-bold text-brand-teal">Create account</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
