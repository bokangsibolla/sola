import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { onboardingStore } from '@/state/onboardingStore';
import { AuthProvider, useAuth } from '@/state/AuthContext';

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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0E0E0E',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#9A9A9A',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#E5653A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

function AuthGate() {
  const router = useRouter();
  const segments = useSegments();
  const { userId, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!router || !segments || segments.length < 1) return;

    const currentGroup = segments[0];
    const isOnboardingCompleted = onboardingStore.get('onboardingCompleted');

    if (currentGroup === '(onboarding)' && userId && isOnboardingCompleted) {
      router.replace('/(tabs)/home');
    } else if (currentGroup === '(tabs)' && !userId) {
      router.replace('/(onboarding)/welcome');
    }
  }, [segments, router, userId, authLoading]);

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

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [storeReady, setStoreReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    'PlusJakartaSans-Regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'PlusJakartaSans-SemiBold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'InstrumentSerif-Regular': require('../assets/fonts/InstrumentSerif-Regular.ttf'),
  });

  useEffect(() => {
    onboardingStore.hydrate().then(() => setStoreReady(true));
  }, []);

  useEffect(() => {
    if (fontsLoaded && storeReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, storeReady]);

  if (!fontsLoaded || !storeReady) return null;

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthGate />
        </ThemeProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
