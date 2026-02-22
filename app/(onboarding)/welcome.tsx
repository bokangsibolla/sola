import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePostHog } from 'posthog-react-native';
import { signInWithGoogle } from '@/lib/oauth';
import { onboardingStore } from '@/state/onboardingStore';
import { warmupConnection } from '@/lib/supabase';
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
      await warmupConnection();
      const result = await signInWithGoogle();
      posthog.capture('auth_success', { provider: 'google', is_new_user: result.isNewUser });
      if (result.isNewUser) {
        router.push('/(onboarding)/profile' as any);
      } else {
        await onboardingStore.set('onboardingCompleted', true);
        router.replace('/(tabs)/home' as any);
      }
    } catch (e: any) {
      if (e.message?.includes('cancelled')) return;
      posthog.capture('auth_failed', { provider: 'google', error: e.message });
      Alert.alert('Sign in failed', e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
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
          <SolaText style={styles.tagline}>Because women travel differently.</SolaText>
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
          <SolaText style={styles.ctaText}>Create new account</SolaText>
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
          <SolaText style={styles.loginText}>I already have an account</SolaText>
        </Pressable>

        {/* OR divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <SolaText style={styles.dividerLabel}>OR</SolaText>
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
              <SolaText style={styles.googleG}>G</SolaText>
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
    color: '#FFFFFF',
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
  loginLink: {
    paddingVertical: 2,
  },
  loginText: {
    fontFamily: fonts.medium,
    fontSize: 14,
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
    color: '#4285F4',
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
  },
});
