// Hermes polyfill MUST be first — fixes Set/Map iteration across all dependencies
import '@/lib/hermes-polyfill';
// gesture-handler MUST be imported before other UI imports
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import * as Sentry from '@sentry/react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, radius } from '@/constants/design';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import * as SplashScreen from 'expo-splash-screen';

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
  tracesSampleRate: 0.2,
});
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

const queryClient = new QueryClient();

import { useColorScheme } from '@/hooks/use-color-scheme';
import { PostHogProvider, usePostHog } from 'posthog-react-native';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { onboardingStore } from '@/state/onboardingStore';
import { AuthProvider, useAuth } from '@/state/AuthContext';
import { PreferencesProvider } from '@/state/PreferencesContext';
import { initI18n } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import OfflineBanner from '@/components/OfflineBanner';

// Ensure icon fonts are available (Ionicons uses native fonts, no explicit loading needed)
// Importing here ensures the icon library is initialized before use

// Keep the native splash visible while we load fonts
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: '(onboarding)',
};

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <View style={errorStyles.container}>
      <Text style={errorStyles.title}>Something went wrong</Text>
      <Text style={errorStyles.message}>{error.message}</Text>
      <Pressable style={errorStyles.button} onPress={retry}>
        <Text style={errorStyles.buttonText}>Try again</Text>
      </Pressable>
    </View>
  );
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  message: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.button,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.background,
  },
});

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const { userId, loading: authLoading } = useAuth();

  usePushNotifications(userId);

  const posthog = usePostHog();

  useEffect(() => {
    if (userId) posthog.identify(userId);
  }, [userId, posthog]);

  useEffect(() => {
    if (authLoading) return;
    if (!router || !segments || segments.length < 1) return;

    const currentGroup = segments[0];
    const isOnboardingCompleted = onboardingStore.get('onboardingCompleted');

    if (currentGroup === '(onboarding)' && userId && isOnboardingCompleted) {
      router.replace('/(tabs)/explore');
    } else if (currentGroup === '(onboarding)' && userId && !isOnboardingCompleted) {
      // Check DB in case onboarding was completed on another device
      supabase
        .from('profiles')
        .select('onboarding_completed_at')
        .eq('id', userId)
        .single()
        .then(({ data }) => {
          if (data?.onboarding_completed_at) {
            onboardingStore.set('onboardingCompleted', true);
            router.replace('/(tabs)/explore');
          }
        });
    } else if (currentGroup === '(tabs)' && !userId) {
      router.replace('/(onboarding)/welcome');
    }
  }, [segments, router, userId, authLoading]);

  if (authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        <StatusBar style="auto" />
      </View>
    );
  }

  return (
    <>
      <Stack initialRouteName="(onboarding)">
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

function RootLayout() {
  const colorScheme = useColorScheme();
  const { isOffline } = useNetworkStatus();

  const [storeReady, setStoreReady] = useState(false);
  const [i18nReady, setI18nReady] = useState(false);
  const [initTimedOut, setInitTimedOut] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'PlusJakartaSans-Regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'PlusJakartaSans-SemiBold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'InstrumentSerif-Regular': require('../assets/fonts/InstrumentSerif-Regular.ttf'),
  });

  useEffect(() => {
    onboardingStore.hydrate().then(() => setStoreReady(true));
    initI18n().then(() => setI18nReady(true)).catch(() => setI18nReady(true));
    const timer = setTimeout(() => setInitTimedOut(true), 10_000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (fontsLoaded && storeReady && i18nReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, storeReady, i18nReady]);

  if (initTimedOut && (!fontsLoaded || !storeReady || !i18nReady)) {
    SplashScreen.hideAsync();
    return (
      <View style={errorStyles.container}>
        <Text style={errorStyles.title}>Taking too long to load</Text>
        <Text style={errorStyles.message}>Please close and reopen the app.</Text>
      </View>
    );
  }

  if (!fontsLoaded || !storeReady || !i18nReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <OfflineBanner visible={isOffline} />
      <QueryClientProvider client={queryClient}>
        <PostHogProvider
          apiKey={process.env.EXPO_PUBLIC_POSTHOG_KEY || ''}
          options={{
            host: 'https://us.i.posthog.com',
            enableSessionReplay: false,
          }}
        >
          <AuthProvider>
            <PreferencesProvider>
              <SafeAreaProvider>
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                  <AuthGate />
                </ThemeProvider>
              </SafeAreaProvider>
            </PreferencesProvider>
          </AuthProvider>
        </PostHogProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);
