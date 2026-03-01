import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePostHog } from 'posthog-react-native';
import { signInWithGoogle } from '@/lib/oauth';
import { onboardingStore } from '@/state/onboardingStore';
import { supabase } from '@/lib/supabase';
import { colors, fonts, spacing } from '@/constants/design';

const { height: SCREEN_H } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const posthog = usePostHog();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    posthog.capture('welcome_screen_viewed');
  }, [posthog]);

  const handleGoogle = async () => {
    posthog.capture('oauth_login_tapped', { provider: 'google', source: 'welcome' });
    setLoading(true);
    try {
      const result = await signInWithGoogle();

      // Verify session is actually established before navigating
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Sign-in succeeded but session was not saved. Please try again.');
      }

      posthog.capture('auth_success', { provider: 'google', is_new_user: result.isNewUser });
      if (result.isNewUser) {
        // Pre-populate onboarding store with Google metadata
        if (result.userMetadata?.firstName) {
          onboardingStore.set('firstName', result.userMetadata.firstName);
        }
        setLoading(false);
        router.push('/(onboarding)/profile' as any);
      } else {
        // Set the flag — AuthGate will detect we're on the welcome screen
        // with a valid session and redirect to tabs. This prevents a race
        // condition where both this handler and AuthGate navigate simultaneously.
        onboardingStore.set('onboardingCompleted', true);
        // Keep loading=true so the spinner stays visible until AuthGate navigates
      }
    } catch (e: any) {
      setLoading(false);
      if (e.message?.includes('cancelled')) return;
      posthog.capture('auth_failed', { provider: 'google', error: e.message });
      Alert.alert('Sign in failed', e.message ?? 'Something went wrong');
    }
  };

  const navigateTo = (screen: string) => {
    // Use setTimeout to ensure navigation happens after current render cycle —
    // workaround for Expo Router Android bug with group-prefixed paths
    setTimeout(() => {
      router.push(screen as any);
    }, 0);
  };

  return (
    <View style={styles.container}>
      {/* Hero image — top ~65% */}
      <View style={[styles.imageSection, { height: SCREEN_H * 0.74 }]}>
        <Image
          source={require('@/assets/images/welcome-hero.jpg')}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
        />
        <View style={styles.overlay} />

        <View style={styles.logoBlock}>
          <Image
            source={require('@/assets/images/sola-logo-original.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.tagline}>Because women travel differently.</Text>
        </View>
      </View>

      {/* Bottom white card */}
      <View style={[styles.card, { paddingBottom: insets.bottom || 8 }]}>
        {/* Orange CTA */}
        <Pressable
          style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaPressed]}
          onPress={() => {
            posthog.capture('create_account_tapped', { source: 'welcome' });
            navigateTo('/(onboarding)/create-account');
          }}
        >
          <Text style={styles.ctaText}>Create new account</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </Pressable>

        {/* Login link */}
        <Pressable
          style={styles.loginLink}
          hitSlop={8}
          onPress={() => {
            posthog.capture('login_tapped', { source: 'welcome' });
            navigateTo('/(onboarding)/login');
          }}
        >
          <Text style={styles.loginText}>I already have an account</Text>
        </Pressable>

        {/* OR divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social icons */}
        <View style={styles.socialRow}>
          <Pressable
            style={styles.socialCircleDisabled}
            onPress={() => Alert.alert('Coming soon', 'Apple Sign-In will be available soon.')}
          >
            <Ionicons name="logo-apple" size={20} color={colors.textMuted} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.socialCircle, pressed && styles.socialPressed]}
            onPress={handleGoogle}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.textPrimary} />
            ) : (
              <Text style={styles.googleG}>G</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  imageSection: {
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  logoBlock: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 150,
    height: 64,
  },
  tagline: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 8,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    paddingTop: 20,
    paddingHorizontal: spacing.screenX,
    alignItems: 'center',
    gap: 10,
  },
  ctaButton: {
    backgroundColor: colors.orange,
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    alignSelf: 'stretch',
  },
  ctaPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  ctaText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFF',
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
  loginLink: {
    paddingVertical: 2,
  },
  loginText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textPrimary,
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderDefault,
  },
  dividerLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    paddingHorizontal: 14,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
  },
  socialCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  socialCircleDisabled: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutralFill,
    opacity: 0.45,
  },
  socialPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  googleG: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
    color: '#4285F4',
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
});
