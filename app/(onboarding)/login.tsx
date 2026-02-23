import React, { useEffect, useState } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePostHog } from 'posthog-react-native';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { supabase, diagnoseNetwork, warmupConnection } from '@/lib/supabase';
import { signInWithGoogle, signInWithApple } from '@/lib/oauth';
import { onboardingStore } from '@/state/onboardingStore';
import { colors, fonts, radius, spacing } from '@/constants/design';

function getAuthErrorMessage(error: { message: string; status?: number }): string {
  const msg = error.message?.toLowerCase() ?? '';
  if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
    return 'Incorrect email or password. Please try again.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Please confirm your email before logging in. Check your inbox.';
  }
  if (msg.includes('no user') || msg.includes('user not found')) {
    return 'No account found with this email. Try creating an account instead.';
  }
  if (msg.includes('rate limit') || msg.includes('too many')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  if (msg.includes('network') || msg.includes('fetch')) {
    return 'Unable to connect. Please check your internet connection.';
  }
  return error.message || 'Something went wrong. Please try again.';
}

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const posthog = usePostHog();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    posthog.capture('login_screen_viewed');
  }, [posthog]);

  const handleOAuth = async (provider: 'google' | 'apple') => {
    posthog.capture('oauth_login_tapped', { provider });
    setLoading(true);
    setFieldError(null);
    try {
      // Prime the connection pool on Android before auth
      await warmupConnection();
      const result =
        provider === 'google' ? await signInWithGoogle() : await signInWithApple();

      // Verify session is actually established before navigating
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Sign-in succeeded but session was not saved. Please try again.');
      }

      posthog.capture('auth_success', { provider, is_new_user: result.isNewUser });
      if (result.isNewUser) {
        // Pre-populate onboarding store with OAuth metadata
        if (result.userMetadata?.firstName) {
          onboardingStore.set('firstName', result.userMetadata.firstName);
        }
        router.push('/(onboarding)/profile' as any);
      } else {
        await onboardingStore.set('onboardingCompleted', true);
        // Defer navigation on Android — Expo Router bug with cross-group replace
        if (Platform.OS === 'android') {
          setTimeout(() => router.replace('/(tabs)/home' as any), 50);
        } else {
          router.replace('/(tabs)/home' as any);
        }
      }
    } catch (e: any) {
      if (e.message?.includes('cancelled')) return;
      posthog.capture('auth_failed', { provider, error: e.message });
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

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canLogin = isValidEmail && password.length > 0 && !loading;

  const handleLogin = async () => {
    setFieldError(null);

    if (!isValidEmail) {
      setFieldError('Please enter a valid email address.');
      return;
    }
    if (password.length === 0) {
      setFieldError('Please enter your password.');
      return;
    }

    posthog.capture('email_login_attempted');
    setLoading(true);

    try {
      // Prime the connection pool on Android before auth
      await warmupConnection();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        posthog.capture('auth_failed', { provider: 'email', error: error.message });
        setFieldError(getAuthErrorMessage(error));
        return;
      }

      if (!data.user) {
        setFieldError('Something went wrong. Please try again.');
        return;
      }

      posthog.capture('auth_success', { provider: 'email', is_new_user: false });

      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, onboarding_completed_at')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!profile) {
        // User exists in auth but no profile — needs onboarding
        router.push('/(onboarding)/profile' as any);
      } else if (!profile.onboarding_completed_at) {
        router.push('/(onboarding)/profile' as any);
      } else {
        await onboardingStore.set('onboardingCompleted', true);
        // Defer navigation on Android — Expo Router bug with cross-group replace
        if (Platform.OS === 'android') {
          setTimeout(() => router.replace('/(tabs)/home' as any), 50);
        } else {
          router.replace('/(tabs)/home' as any);
        }
      }
    } catch (e: any) {
      const msg = e.message?.toLowerCase() ?? '';
      if (msg.includes('network') || msg.includes('fetch')) {
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

  const handleForgotPassword = async () => {
    if (!isValidEmail) {
      Alert.alert('Enter your email', 'Please enter your email address first, then tap "Forgot password?".');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        Alert.alert('Error', getAuthErrorMessage(error));
      } else {
        Alert.alert(
          'Check your email',
          'We sent a password reset link to your email address.',
        );
      }
    } catch (e: any) {
      Alert.alert('Error', 'Failed to send reset email. Please try again.');
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
            disabled={loading}
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
          <View style={[styles.passwordContainer, fieldError && isValidEmail && styles.inputError]}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={(t) => { setPassword(t); setFieldError(null); }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="current-password"
              textContentType="password"
              onSubmitEditing={handleLogin}
              returnKeyType="done"
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
        ) : null}

        <Pressable onPress={handleForgotPassword} style={styles.forgotButton} hitSlop={8}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </Pressable>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 64 : 0) + 16 }]}>
        <PrimaryButton label="Log in" onPress={handleLogin} disabled={!canLogin} />
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
    backgroundColor: colors.neutralFill,
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
  googleIcon: {
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
  errorText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.emergency,
    textAlign: 'center',
    marginTop: 14,
  },
  forgotButton: {
    alignSelf: 'center',
    marginTop: 16,
  },
  forgotText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textMuted,
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
