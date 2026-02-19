import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostHog } from 'posthog-react-native';
import { supabase } from '@/lib/supabase';
import { onboardingStore } from '@/state/onboardingStore';
import {
  fetchOnboardingConfig,
  calculateOnboardingFlow,
  createOnboardingSession,
} from '@/lib/onboardingConfig';
import { colors, fonts, radius, spacing } from '@/constants/design';

const CODE_LENGTH = 6;

export default function VerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const posthog = usePostHog();
  const { email, mode } = useLocalSearchParams<{ email: string; mode: 'login' | 'signup' }>();

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    // Auto-focus the input
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleVerify = async () => {
    if (code.length !== CODE_LENGTH) return;
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email!,
        token: code,
        type: 'email',
      });

      if (error) {
        Alert.alert('Verification failed', error.message);
        setLoading(false);
        return;
      }

      if (!data.user) {
        Alert.alert('Verification failed', 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      posthog.capture('auth_success', { provider: 'magic_link', mode });

      // Check if user has a profile (existing vs new user)
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!profile) {
        // New user — go through onboarding
        onboardingStore.set('email', email!);

        try {
          const config = await fetchOnboardingConfig();
          const flowResult = calculateOnboardingFlow(config, data.user.id);
          onboardingStore.set('questionsToShow', flowResult.questionsToShow);
          onboardingStore.set('screensToShow', flowResult.screensToShow);
          onboardingStore.set('profileOptionalFields', flowResult.profileOptionalFields);
          onboardingStore.set('configSnapshot', flowResult.configSnapshot);
          const sessionId = await createOnboardingSession(data.user.id, flowResult);
          if (sessionId) onboardingStore.set('abTestSessionId', sessionId);
          posthog.capture('onboarding_flow_started', {
            questions_shown: flowResult.questionsToShow,
            screens_shown: flowResult.screensToShow,
            session_id: sessionId,
          });
        } catch {
          // Non-blocking
        }

        router.push('/(onboarding)/profile');
      } else {
        // Existing user — go straight home
        await onboardingStore.set('onboardingCompleted', true);
        router.replace('/(tabs)/home');
      }
    } catch (e: any) {
      Alert.alert('Verification failed', e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: email! });
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Code sent', 'Check your email for a new verification code.');
      }
    } catch {
      Alert.alert('Error', 'Failed to resend code.');
    } finally {
      setResending(false);
    }
  };

  const handleCodeChange = (text: string) => {
    // Only allow digits
    const cleaned = text.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(cleaned);
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
        <Text style={styles.headline}>Check your email</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.emailText}>{email}</Text>
        </Text>
      </View>

      {/* Code input */}
      <View style={styles.content}>
        <TextInput
          ref={inputRef}
          style={styles.codeInput}
          value={code}
          onChangeText={handleCodeChange}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          placeholder="000000"
          placeholderTextColor={colors.borderDefault}
          autoComplete="one-time-code"
          textContentType="oneTimeCode"
        />

        <Pressable
          style={[
            styles.verifyButton,
            code.length !== CODE_LENGTH && styles.verifyButtonDisabled,
          ]}
          onPress={handleVerify}
          disabled={code.length !== CODE_LENGTH || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <Text style={styles.verifyButtonText}>Verify</Text>
          )}
        </Pressable>

        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Didn't get the code? </Text>
          <Pressable onPress={handleResend} disabled={resending}>
            {resending ? (
              <ActivityIndicator size="small" color={colors.orange} />
            ) : (
              <Text style={styles.resendLink}>Resend</Text>
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
  emailText: {
    fontFamily: fonts.semiBold,
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: spacing.screenX,
    paddingTop: 32,
  },
  codeInput: {
    height: 56,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    paddingHorizontal: 16,
    fontFamily: fonts.semiBold,
    fontSize: 24,
    letterSpacing: 8,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: colors.orange,
    height: 52,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  verifyButtonDisabled: {
    opacity: 0.35,
  },
  verifyButtonText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.background,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  resendLabel: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  resendLink: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.orange,
  },
});
