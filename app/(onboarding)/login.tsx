import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostHog } from 'posthog-react-native';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { supabase } from '@/lib/supabase';
import { useGoogleAuth, signInWithApple } from '@/lib/oauth';
import { onboardingStore } from '@/state/onboardingStore';
import { colors, fonts, radius, spacing } from '@/constants/design';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const posthog = usePostHog();
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    posthog.capture('login_screen_viewed');
  }, [posthog]);

  const { request: googleRequest, signInWithGoogle } = useGoogleAuth();

  const handleOAuth = async (provider: 'google' | 'apple') => {
    posthog.capture('oauth_login_tapped', { provider });
    setLoading(true);
    try {
      const result =
        provider === 'google' ? await signInWithGoogle() : await signInWithApple();

      posthog.capture('auth_success', { provider, is_new_user: result.isNewUser });
      if (result.isNewUser) {
        router.push('/(onboarding)/profile');
      } else {
        await onboardingStore.set('onboardingCompleted', true);
        router.replace('/(tabs)/home');
      }
    } catch (e: any) {
      if (e.message?.includes('cancelled')) return;
      posthog.capture('auth_failed', { provider, error: e.message });
      Alert.alert('Sign in failed', e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const canLogin = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !loading;

  const handleLogin = async () => {
    posthog.capture('magic_link_login_attempted');
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({ email });

      if (error) {
        posthog.capture('auth_failed', { provider: 'magic_link', error: error.message });
        Alert.alert('Something went wrong', error.message);
        return;
      }

      posthog.capture('magic_link_sent', { mode: 'login' });
      router.push({ pathname: '/(onboarding)/verify', params: { email, mode: 'login' } });
    } catch (e: any) {
      Alert.alert('Something went wrong', e.message ?? 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      {/* Back */}
      <View style={styles.navRow}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
        </Pressable>
      </View>

      {/* Headline */}
      <View style={styles.headlineBlock}>
        <Text style={styles.headline}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to your account</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Social login */}
        <View style={styles.socialButtons}>
          <Pressable
            style={({ pressed }) => [styles.socialButton, pressed && styles.socialPressed]}
            disabled={!googleRequest || loading}
            onPress={() => handleOAuth('google')}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.textMuted} />
            ) : (
              <>
                <Text style={styles.googleIcon}>G</Text>
                <Text style={styles.socialText}>Continue with Google</Text>
              </>
            )}
          </Pressable>
          {Platform.OS === 'ios' && (
            <Pressable
              style={({ pressed }) => [styles.socialButton, styles.appleButton, pressed && styles.socialPressed]}
              disabled={loading}
              onPress={() => handleOAuth('apple')}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="logo-apple" size={18} color="#FFFFFF" />
                  <Text style={[styles.socialText, styles.appleText]}>Continue with Apple</Text>
                </>
              )}
            </Pressable>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Email field */}
        <View style={styles.fields}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <Text style={styles.hint}>We'll send you a verification code — no password needed.</Text>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 64 : 0) + 16 }]}>
        <PrimaryButton label="Send code" onPress={handleLogin} disabled={!canLogin} />
        <View style={styles.signupRow}>
          <Text style={styles.signupLabel}>New here? </Text>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.signupLink}>Create account</Text>
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
  navRow: {
    paddingHorizontal: spacing.screenX,
    marginBottom: 8,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F3F3',
  },
  headlineBlock: {
    paddingHorizontal: spacing.screenX,
    paddingTop: 28,
    paddingBottom: 8,
  },
  headline: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    lineHeight: 30,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textMuted,
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenX,
    paddingTop: 28,
  },
  socialButtons: {
    gap: 10,
    marginBottom: 28,
  },
  socialButton: {
    height: 50,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.background,
  },
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  socialPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  googleIcon: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: '#4285F4',
  },
  socialText: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  appleText: {
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderDefault,
  },
  dividerText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    paddingHorizontal: 16,
  },
  fields: {
    gap: 14,
  },
  input: {
    height: 50,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 16,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    paddingHorizontal: spacing.screenX,
    marginTop: 14,
  },
  footer: {
    paddingHorizontal: spacing.screenX,
    paddingTop: 16,
    alignItems: 'center',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signupLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  signupLink: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
