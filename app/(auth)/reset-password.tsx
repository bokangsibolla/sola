import { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { colors, fonts, radius, spacing } from '@/constants/design';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isValid = password.length >= 6 && password === confirmPassword;

  const handleResetPassword = async () => {
    if (password.length < 6) {
      Alert.alert('Invalid password', 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match', 'Please make sure both passwords are the same.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    Alert.alert('Password updated', 'Your password has been successfully reset.', [
      {
        text: 'OK',
        onPress: () => router.replace('/(onboarding)/login' as any),
      },
    ]);
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
        <SolaText style={styles.headline}>Reset password</SolaText>
        <SolaText style={styles.subtitle}>Enter your new password below</SolaText>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.fields}>
          <TextInput
            style={styles.input}
            placeholder="New password"
            placeholderTextColor={colors.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor={colors.textMuted}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <SolaText style={styles.hint}>Password must be at least 6 characters</SolaText>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <PrimaryButton
          label="Reset password"
          onPress={handleResetPassword}
          disabled={!isValid || loading}
        />
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
    marginTop: 12,
  },
  footer: {
    paddingHorizontal: spacing.screenX,
    paddingTop: 16,
    alignItems: 'center',
  },
});
