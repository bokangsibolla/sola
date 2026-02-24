import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/state/AuthContext';
import { useData } from '@/hooks/useData';
import { getProfileById } from '@/data/api';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';

const DISMISS_KEY = '@sola:dismissed_verification_nudge';

export function VerificationNudge() {
  const router = useRouter();
  const { userId } = useAuth();
  const [dismissed, setDismissed] = useState(true); // default hidden until loaded

  const { data: profile } = useData(
    () => (userId ? getProfileById(userId) : Promise.resolve(null)),
    ['profile', userId],
  );

  useEffect(() => {
    AsyncStorage.getItem(DISMISS_KEY).then((v) => setDismissed(v === 'true'));
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    AsyncStorage.setItem(DISMISS_KEY, 'true');
  }, []);

  const status = profile?.verificationStatus;
  if (dismissed || !status || status === 'verified' || status === 'pending') return null;

  const isRejected = status === 'rejected';

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && { opacity: pressedState.opacity, transform: pressedState.transform },
        ]}
        onPress={() => router.push('/(tabs)/home/verify' as any)}
        accessibilityRole="button"
        accessibilityLabel="Verify your identity"
      >
        <View style={styles.iconContainer}>
          <Ionicons
            name={isRejected ? 'alert-circle' : 'shield-checkmark'}
            size={24}
            color={isRejected ? colors.emergency : colors.orange}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>
            {isRejected ? 'Verification needs another try' : 'Verify your identity'}
          </Text>
          <Text style={styles.subtitle}>
            {isRejected
              ? 'Your previous selfie wasn\u2019t approved. A clear, well-lit photo helps.'
              : 'A quick selfie helps keep our community safe and trusted.'}
          </Text>
        </View>

        <Pressable onPress={dismiss} hitSlop={12} style={styles.closeBtn}>
          <Ionicons name="close" size={16} color={colors.textMuted} />
        </Pressable>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    padding: spacing.lg,
    gap: spacing.md,
  },
  iconContainer: {
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  closeBtn: {
    padding: spacing.xs,
    marginTop: -spacing.xs,
    marginRight: -spacing.xs,
  },
});
