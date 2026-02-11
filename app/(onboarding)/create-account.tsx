import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePostHog } from 'posthog-react-native';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import { onboardingStore } from '@/state/onboardingStore';
import { supabase } from '@/lib/supabase';
import { useGoogleAuth, signInWithApple } from '@/lib/oauth';
import {
  fetchOnboardingConfig,
  calculateOnboardingFlow,
  createOnboardingSession,
} from '@/lib/onboardingConfig';
import { colors, fonts, radius } from '@/constants/design';

/** Initialize the A/B testing flow for a new user */
async function initializeOnboardingFlow(userId: string, posthog: ReturnType<typeof usePostHog>) {
  try {
    // Fetch config from Supabase (with fallback to defaults)
    const config = await fetchOnboardingConfig();

    // Calculate which questions/screens to show based on user ID
    const flowResult = calculateOnboardingFlow(config, userId);

    // Store in onboardingStore for use throughout onboarding
    onboardingStore.set('questionsToShow', flowResult.questionsToShow);
    onboardingStore.set('screensToShow', flowResult.screensToShow);
    onboardingStore.set('profileOptionalFields', flowResult.profileOptionalFields);
    onboardingStore.set('configSnapshot', flowResult.configSnapshot);

    // Create session record in database
    const sessionId = await createOnboardingSession(userId, flowResult);
    if (sessionId) {
      onboardingStore.set('abTestSessionId', sessionId);
    }

    // Track flow started in PostHog
    posthog.capture('onboarding_flow_started', {
      questions_shown: flowResult.questionsToShow,
      screens_shown: flowResult.screensToShow,
      session_id: sessionId,
    });
  } catch {
    // Non-blocking: if A/B setup fails, onboarding still works with defaults
  }
}

export default function CreateAccountScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const { request: googleRequest, signInWithGoogle } = useGoogleAuth();

  const canContinue = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && password.length >= 6 && !loading;

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setLoading(true);
    try {
      const result =
        provider === 'google' ? await signInWithGoogle() : await signInWithApple();

      if (result.isNewUser) {
        // Initialize A/B testing flow for new user
        if (result.userId) {
          await initializeOnboardingFlow(result.userId, posthog);
        }
        router.push('/(onboarding)/profile');
      } else {
        await onboardingStore.set('onboardingCompleted', true);
        router.replace('/(tabs)/home');
      }
    } catch (e: any) {
      if (e.message?.includes('cancelled')) return; // user dismissed
      Alert.alert('Sign in failed', e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        Alert.alert('Sign up failed', error.message);
        return;
      }

      onboardingStore.set('email', email);

      // Initialize A/B testing flow for new user
      if (data.user?.id) {
        await initializeOnboardingFlow(data.user.id, posthog);
      }

      router.push('/(onboarding)/profile');
    } catch (e: any) {
      Alert.alert('Sign up failed', e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingScreen
      stage={2}
      headline="Let's get you in."
      subtitle="Travel information designed for how women travel."
      ctaLabel="Create account"
      ctaDisabled={!canContinue}
      onCtaPress={handleContinue}
    >
      {/* Social login buttons */}
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
              <Text style={styles.socialIcon}>G</Text>
              <Text style={styles.socialText}>Continue with Google</Text>
            </>
          )}
        </Pressable>
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
      </View>

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Email/password fields */}
      <View style={styles.fields}>
        <TextInput
          style={styles.input}
          placeholder="Your email"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoFocus={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Create a password"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoFocus={false}
        />
      </View>

      <View style={styles.loginRow}>
        <Text style={styles.loginLabel}>Already have an account? </Text>
        <Pressable onPress={() => router.push('/(onboarding)/login')}>
          <Text style={styles.loginLink}>Log in</Text>
        </Pressable>
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
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
  socialIcon: {
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
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 28,
  },
  loginLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
  },
  loginLink: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
