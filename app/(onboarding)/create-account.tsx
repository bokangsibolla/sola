import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePostHog } from 'posthog-react-native';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import { onboardingStore } from '@/state/onboardingStore';
import { supabase, diagnoseNetwork, warmupConnection } from '@/lib/supabase';
import { signInWithGoogle, signInWithApple } from '@/lib/oauth';
import { colors, fonts, radius, spacing } from '@/constants/design';

const MIN_PASSWORD_LENGTH = 8;

function getAuthErrorMessage(error: { message: string; status?: number }): string {
  const msg = error.message?.toLowerCase() ?? '';
  if (msg.includes('already registered') || msg.includes('already been registered')) {
    return 'An account with this email already exists. Try logging in instead.';
  }
  if (msg.includes('valid email') || msg.includes('invalid email')) {
    return 'Please enter a valid email address.';
  }
  if (msg.includes('password') && msg.includes('short')) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (msg.includes('rate limit') || msg.includes('too many')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Unable to connect. Please check your internet connection.';
  }
  return error.message || 'Something went wrong. Please try again.';
}

export default function CreateAccountScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPassword = password.length >= MIN_PASSWORD_LENGTH;
  const canContinue = isValidEmail && isValidPassword && !loading;

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setLoading(true);
    setFieldError(null);
    try {
      await warmupConnection();
      const result =
        provider === 'google' ? await signInWithGoogle() : await signInWithApple();

      posthog.capture('auth_success', { provider, is_new_user: result.isNewUser });
      if (result.isNewUser) {
        router.push('/(onboarding)/profile' as any);
      } else {
        await onboardingStore.set('onboardingCompleted', true);
        router.replace('/(tabs)/home' as any);
      }
    } catch (e: any) {
      if (e.message?.includes('cancelled')) return;
      const msg = e.message?.toLowerCase() ?? '';
      if (msg.includes('network') || msg.includes('fetch')) {
        try {
          const diag = await diagnoseNetwork();
          Alert.alert('Network Diagnostic', diag.details + `\n\nError: ${e.message}`);
        } catch {
          Alert.alert('Sign in failed', e.message);
        }
      } else {
        Alert.alert('Sign in failed', e.message ?? 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    setFieldError(null);

    if (!isValidEmail) {
      setFieldError('Please enter a valid email address.');
      return;
    }
    if (!isValidPassword) {
      setFieldError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setLoading(true);
    try {
      await warmupConnection();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setFieldError(getAuthErrorMessage(error));
        return;
      }

      if (!data.user) {
        setFieldError('Something went wrong. Please try again.');
        return;
      }

      // If email confirmation is required, Supabase returns a user with
      // identities = [] (unconfirmed). Route to verify screen.
      // If auto-confirm is on, user is fully authenticated — go to profile.
      const needsConfirmation =
        data.user.identities?.length === 0 ||
        (!data.session && data.user.email_confirmed_at === null);

      if (needsConfirmation) {
        posthog.capture('signup_initiated', { provider: 'email', needs_confirmation: true });
        router.push({
          pathname: '/(onboarding)/verify' as any,
          params: { email, mode: 'signup' },
        });
      } else {
        // Auto-confirmed — go to profile setup
        posthog.capture('auth_success', { provider: 'email', is_new_user: true });
        router.push('/(onboarding)/profile' as any);
      }
    } catch (e: any) {
      const msg = e.message?.toLowerCase() ?? '';
      if (msg.includes('network') || msg.includes('fetch')) {
        // Run diagnostics to get more detail
        try {
          const diag = await diagnoseNetwork();
          Alert.alert('Network Diagnostic', diag.details + `\n\nError: ${e.message}`);
        } catch {
          setFieldError(`Network error: ${e.message}`);
        }
      } else {
        setFieldError(e.message ?? 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingScreen
      stage={2}
      headline="Create your account"
      subtitle="Travel information designed for how women travel."
      ctaLabel="Create account"
      ctaDisabled={!canContinue}
      onCtaPress={handleSignUp}
    >
      {/* Social login buttons */}
      <View style={styles.socialButtons}>
        <Pressable
          style={({ pressed }) => [styles.socialButton, pressed && styles.socialPressed]}
          disabled={loading}
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
        <Text style={styles.dividerText}>or continue with email</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Email + Password fields */}
      <View style={styles.fields}>
        <TextInput
          style={[styles.input, fieldError && !isValidEmail && styles.inputError]}
          placeholder="Email"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={(t) => { setEmail(t); setFieldError(null); }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <View style={[styles.passwordContainer, fieldError && isValidEmail && !isValidPassword && styles.inputError]}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Password (8+ characters)"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={(t) => { setPassword(t); setFieldError(null); }}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
            hitSlop={8}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        </View>
      </View>

      {fieldError ? (
        <Text style={styles.errorText}>{fieldError}</Text>
      ) : (
        <Text style={styles.hint}>
          Your password must be at least {MIN_PASSWORD_LENGTH} characters.
        </Text>
      )}

      <View style={styles.loginRow}>
        <Text style={styles.loginLabel}>Already have an account? </Text>
        <Pressable onPress={() => router.push('/(onboarding)/login' as any)}>
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
    minHeight: 50,
    paddingVertical: 12,
    paddingHorizontal: 20,
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
    lineHeight: 20,
    color: colors.textPrimary,
    ...(Platform.OS === 'android' && { includeFontPadding: false }),
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
  inputError: {
    borderColor: colors.emergency,
  },
  passwordContainer: {
    height: 50,
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
  },
  eyeButton: {
    paddingHorizontal: 14,
    height: '100%',
    justifyContent: 'center',
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.emergency,
    textAlign: 'center',
    marginTop: 16,
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
