import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePostHog } from 'posthog-react-native';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import { onboardingStore } from '@/state/onboardingStore';
import { supabase } from '@/lib/supabase';
import { useGoogleAuth, signInWithApple } from '@/lib/oauth';
import { colors, fonts, radius } from '@/constants/design';

export default function CreateAccountScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);

  const { request: googleRequest, signInWithGoogle } = useGoogleAuth();

  const canContinue = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !loading;

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setLoading(true);
    try {
      const result =
        provider === 'google' ? await signInWithGoogle() : await signInWithApple();

      if (result.isNewUser) {
        router.push('/(onboarding)/profile');
      } else {
        await onboardingStore.set('onboardingCompleted', true);
        router.replace('/(tabs)/home');
      }
    } catch (e: any) {
      if (e.message?.includes('cancelled')) return;
      Alert.alert('Sign in failed', e.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    try {
      // Retry up to 2 times on network failure
      let lastError: any;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const { error } = await supabase.auth.signInWithOtp({ email });

          if (error) {
            Alert.alert('Something went wrong', error.message);
            return;
          }

          posthog.capture('magic_link_sent', { mode: 'signup' });
          router.push({ pathname: '/(onboarding)/verify', params: { email, mode: 'signup' } });
          return;
        } catch (e: any) {
          lastError = e;
          if (attempt < 2 && e.message?.includes('Network')) {
            await new Promise(r => setTimeout(r, 1000));
            continue;
          }
          break;
        }
      }
      Alert.alert('Connection error', 'Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingScreen
      stage={2}
      headline="Let's get you in."
      subtitle="Travel information designed for how women travel."
      ctaLabel="Continue"
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

      {/* Email field */}
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
      </View>

      <Text style={styles.hint}>We'll send you a verification code — no password needed.</Text>

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
  hint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
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
