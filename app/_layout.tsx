import 'react-native-gesture-handler';
import '../global.css';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '@/stores/useAuthStore';

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const initAuth = useAuthStore((s) => s.init);

  useEffect(() => {
    return initAuth();
  }, [initAuth]);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const { firebaseUser, profile, initializing } = useAuthStore();

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === '(auth)';
    const onOnboarding = segments[0] === 'onboarding';

    if (!firebaseUser) {
      if (!inAuthGroup) router.replace('/(auth)/login');
      return;
    }

    // Signed in, but profile missing or onboarding incomplete.
    if (!profile || !profile.onboardingCompleted) {
      if (!onOnboarding) router.replace('/onboarding');
      return;
    }

    // Signed in and onboarded.
    if (inAuthGroup || onOnboarding) router.replace('/(tabs)');
  }, [firebaseUser, profile, initializing, router, segments]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ title: 'Your profile' }} />
        <Stack.Screen name="chat/[chatId]" options={{ title: 'Chat' }} />
        <Stack.Screen name="plans/index" options={{ title: 'Plans' }} />
        <Stack.Screen name="plan/[planId]" options={{ title: 'Plan' }} />
      </Stack>
    </ThemeProvider>
  );
}
