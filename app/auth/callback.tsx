import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { onboardingStore } from '@/state/onboardingStore';
import { colors, fonts } from '@/constants/design';

/**
 * OAuth callback screen — handles deep link redirect from sola://auth/callback.
 *
 * When the OAuth provider (Google) redirects back, the URL contains tokens
 * in the fragment (#access_token=...&refresh_token=...). This screen:
 * 1. Extracts tokens from the URL
 * 2. Sets the Supabase session
 * 3. Routes to profile (new user) or home (returning user)
 */
export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function handleCallback() {
      try {
        // Get the URL that opened this screen
        const url = await Linking.getInitialURL();

        if (!url) {
          // No URL — wait briefly for auth state listener to fire, then go home
          setTimeout(() => {
            if (mounted) router.replace('/(tabs)/home');
          }, 2000);
          return;
        }

        // Extract tokens from URL fragment (after #)
        const fragment = url.split('#')[1];
        if (!fragment) {
          // No fragment — might already be authenticated via auth state listener
          setTimeout(() => {
            if (mounted) router.replace('/(tabs)/home');
          }, 2000);
          return;
        }

        const params = new URLSearchParams(fragment);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (!accessToken || !refreshToken) {
          // Check for error in params
          const errorDesc = params.get('error_description') || params.get('error');
          if (errorDesc) {
            if (mounted) setError(decodeURIComponent(errorDesc));
            setTimeout(() => {
              if (mounted) router.replace('/(onboarding)/welcome');
            }, 3000);
            return;
          }
          // No tokens — fall back to waiting for auth state
          setTimeout(() => {
            if (mounted) router.replace('/(tabs)/home');
          }, 2000);
          return;
        }

        // Set the session with extracted tokens
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (sessionError || !data.user) {
          if (mounted) setError(sessionError?.message || 'Failed to establish session');
          setTimeout(() => {
            if (mounted) router.replace('/(onboarding)/welcome');
          }, 3000);
          return;
        }

        // Check if user has a profile (new vs returning)
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!profile) {
          if (mounted) router.replace('/(onboarding)/profile');
        } else {
          await onboardingStore.set('onboardingCompleted', true);
          if (mounted) router.replace('/(tabs)/home');
        }
      } catch (e: any) {
        console.error('[AuthCallback] Error handling OAuth redirect:', e);
        if (mounted) setError(e.message || 'Authentication failed');
        setTimeout(() => {
          if (mounted) router.replace('/(onboarding)/welcome');
        }, 3000);
      }
    }

    handleCallback();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <View style={styles.container}>
      {error ? (
        <>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.hint}>Returning to sign in...</Text>
        </>
      ) : (
        <>
          <ActivityIndicator size="large" color={colors.orange} />
          <Text style={styles.hint}>Signing you in...</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    gap: 16,
  },
  errorText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.emergency,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
});
