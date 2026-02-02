import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import OnboardingScreen from '@/components/onboarding/OnboardingScreen';
import { onboardingStore } from '@/state/onboardingStore';
import { supabase } from '@/lib/supabase';
import { colors, fonts, radius } from '@/constants/design';

export default function CreateAccountScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);

  const canContinue = email.includes('@') && password.length >= 6 && !loading;

  const handleContinue = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Sign up failed', error.message);
      return;
    }

    onboardingStore.set('email', email);
    router.push('/(onboarding)/profile');
  };

  const handleSocialLogin = (provider: string) => {
    // TODO: Wire OAuth with expo-auth-session when ready
    Alert.alert('Coming soon', `${provider} sign-in will be available soon.`);
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
          onPress={() => handleSocialLogin('google')}
        >
          <Text style={styles.socialIcon}>G</Text>
          <Text style={styles.socialText}>Continue with Google</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.socialButton, styles.appleButton, pressed && styles.socialPressed]}
          onPress={() => handleSocialLogin('apple')}
        >
          <Ionicons name="logo-apple" size={18} color="#FFFFFF" />
          <Text style={[styles.socialText, styles.appleText]}>Continue with Apple</Text>
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
    borderRadius: 25,
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
    borderRadius: 14,
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
