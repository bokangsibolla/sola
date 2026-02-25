// URL polyfill MUST be very first — patches globalThis.URL on Hermes so fetch() works
import 'react-native-url-polyfill/auto';
// Hermes polyfill MUST be next — fixes Set/Map iteration across all dependencies
import '@/lib/hermes-polyfill';
// gesture-handler MUST be imported before other UI imports
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import * as Sentry from '@sentry/react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, radius } from '@/constants/design';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import * as SplashScreen from 'expo-splash-screen';

try {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
    tracesSampleRate: 0.2,
  });
} catch (e) {
  console.warn('Sentry init failed:', e);
}
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Retry failed queries up to 2 times with exponential backoff.
      // Critical on Android where TLS provider init can cause the first
      // few API calls after sign-in to fail transiently.
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 5000),
    },
  },
});

import { useColorScheme } from '@/hooks/use-color-scheme';
import { PostHogProvider, usePostHog } from 'posthog-react-native';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { onboardingStore } from '@/state/onboardingStore';
import { AuthProvider, useAuth } from '@/state/AuthContext';
import { PreferencesProvider } from '@/state/PreferencesContext';
import { AppModeProvider } from '@/state/AppModeContext';
import { initI18n } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { captureAttribution, persistAttribution, getAttributionForPostHog } from '@/lib/attribution';
import OfflineBanner from '@/components/OfflineBanner';
import LoadingScreen from '@/components/LoadingScreen';
import { eventTracker } from '@/data/events/eventTracker';

// Global error handler: ensures splash screen hides even on uncaught JS errors.
// Without this, an unhandled exception before React renders leaves the native
// splash visible forever.
const originalHandler = (globalThis as any).ErrorUtils?.getGlobalHandler?.();
(globalThis as any).ErrorUtils?.setGlobalHandler?.((error: any, isFatal: boolean) => {
  console.error('[Sola] Uncaught JS error during startup:', error);
  try { SplashScreen.hideAsync(); } catch {}
  try { Sentry.captureException(error); } catch {}
  if (originalHandler) originalHandler(error, isFatal);
});

// Keep the native splash visible while we load fonts
try {
  SplashScreen.preventAutoHideAsync();
} catch (e) {
  console.warn('SplashScreen.preventAutoHideAsync failed:', e);
}

export const unstable_settings = {
  initialRouteName: 'index',
};

export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  return (
    <View style={errorStyles.container}>
      <View style={errorStyles.iconCircle}>
        <Ionicons name="compass-outline" size={32} color={colors.orange} />
      </View>
      <Text style={errorStyles.title}>We seem to have gotten a little lost</Text>
      <Text style={errorStyles.subtitle}>
        Something unexpected happened, but it's nothing to worry about.
      </Text>
      <Pressable
        style={({ pressed }) => [errorStyles.button, pressed && errorStyles.buttonPressed]}
        onPress={retry}
      >
        <Text style={errorStyles.buttonText}>Take me back</Text>
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
    paddingHorizontal: spacing.xxxl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.orangeFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 20,
    lineHeight: 28,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  button: {
    backgroundColor: colors.orange,
    paddingHorizontal: spacing.xxl,
    paddingVertical: 14,
    borderRadius: radius.button,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    lineHeight: 24,
    color: colors.background,
  },
});

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const { userId, loading: authLoading, recoverSession } = useAuth();

  usePushNotifications(userId);

  const posthog = usePostHog();

  useEffect(() => {
    if (userId) {
      posthog.identify(userId);
      eventTracker.init(userId);
      // Persist UTM attribution to Supabase and PostHog
      persistAttribution(userId);
      getAttributionForPostHog().then((props) => {
        if (props) posthog.identify(userId, { $set_once: props });
      });
    } else {
      eventTracker.destroy();
    }
    return () => eventTracker.destroy();
  }, [userId, posthog]);

  useEffect(() => {
    if (authLoading) return;
    if (!router || !segments || segments.length < 1) return;

    const currentGroup = segments[0] as string;

    const isOnboardingCompleted = onboardingStore.get('onboardingCompleted');

    console.log(`[Sola AuthGate] group=${currentGroup}, userId=${userId?.substring(0, 8) ?? 'null'}, onboarded=${isOnboardingCompleted}`);

    // Helper: replace to tabs with Android setTimeout workaround
    const replaceToTabs = () => {
      if (Platform.OS === 'android') {
        setTimeout(() => router.replace('/(tabs)/home' as any), 50);
      } else {
        router.replace('/(tabs)/home' as any);
      }
    };

    if (currentGroup === '(onboarding)' && userId && isOnboardingCompleted) {
      replaceToTabs();
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
            replaceToTabs();
          }
        });
    } else if (currentGroup === '(tabs)' && !userId) {
      // Session might exist in storage but React state hasn't updated yet
      // (timing issue on Android where navigation triggers before auth state propagates).
      // Verify session from storage before redirecting to avoid false logouts.
      console.log('[Sola AuthGate] Tabs without userId — verifying session from storage...');
      (async () => {
        const recovered = await recoverSession();
        if (!recovered) {
          console.log('[Sola AuthGate] No session in storage — redirecting to welcome');
          router.replace('/(onboarding)/welcome' as any);
        } else {
          console.log('[Sola AuthGate] Session recovered — staying on tabs');
        }
      })();
    }
  }, [segments, router, userId, authLoading, recoverSession]);

  if (authLoading) {
    return <LoadingScreen branded />;
  }

  return (
    <>
      <Stack initialRouteName="index">
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
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
  });

  useEffect(() => {
    onboardingStore.hydrate().then(() => setStoreReady(true)).catch(() => setStoreReady(true));
    initI18n().then(() => setI18nReady(true)).catch(() => setI18nReady(true));
    captureAttribution(); // Capture UTM params from deep link on first open

    // Failsafe: ALWAYS hide splash after 3 seconds no matter what
    const timer = setTimeout(() => {
      setInitTimedOut(true);
      setStoreReady(true);
      setI18nReady(true);
      SplashScreen.hideAsync();
    }, 3_000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && storeReady && i18nReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, storeReady, i18nReady]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
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
                <AppModeProvider>
                  <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                    <AuthGate />
                  </ThemeProvider>
                </AppModeProvider>
              </PreferencesProvider>
            </AuthProvider>
          </PostHogProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Sentry.wrap disabled — was causing splash screen hang on Android production builds.
// Sentry.init() still captures errors via the global handler; .wrap() is only needed
// for React component tree error boundaries which Sentry picks up anyway.
export default RootLayout;
