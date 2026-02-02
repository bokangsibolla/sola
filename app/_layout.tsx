import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { onboardingStore } from '@/state/onboardingStore';

// Ensure icon fonts are available (Ionicons uses native fonts, no explicit loading needed)
// Importing here ensures the icon library is initialized before use

// Keep the native splash visible while we load fonts
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(onboarding)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  // IMPORTANT: update filenames below to match exactly what’s in `assets/fonts/`
  const [fontsLoaded, fontError] = useFonts({
    'PlusJakartaSans-Regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'PlusJakartaSans-SemiBold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'InstrumentSerif-Regular': require('../assets/fonts/InstrumentSerif-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    // Wait for router to be mounted before attempting navigation
    if (!router || !segments || segments.length < 1) return;

    const isOnboardingCompleted = onboardingStore.get('onboardingCompleted');
    const currentGroup = segments[0];

    // Only redirect if user has completed onboarding and is in onboarding group
    // Don't interfere with navigation within onboarding flow
    if (currentGroup === '(onboarding)' && isOnboardingCompleted) {
      router.replace('/(tabs)/home');
    }
  }, [segments, router]);

  // Don’t render navigation until fonts are ready
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack initialRouteName="(onboarding)">
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
