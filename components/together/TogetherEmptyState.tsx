import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  spacing,
  radius,
  typography,
  pressedState,
} from '@/constants/design';

interface TogetherEmptyStateProps {
  cityName?: string;
  onCreatePost: () => void;
}

const ICON_SIZE = 48;
const CTA_HEIGHT = 48;

export const TogetherEmptyState: React.FC<TogetherEmptyStateProps> = ({
  cityName,
  onCreatePost,
}) => {
  const headline = cityName
    ? `No activities posted in ${cityName} yet`
    : 'No activities posted yet';

  return (
    <View style={styles.container}>
      <Ionicons name="people-outline" size={ICON_SIZE} color={colors.textMuted} />

      <Text style={styles.headline}>{headline}</Text>

      <Text style={styles.subline}>
        Be the first -- post what you are looking for or open up a plan from your
        itinerary
      </Text>

      <Pressable
        style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        onPress={onCreatePost}
      >
        <Text style={styles.ctaText}>Post an activity</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.xxxxl,
    gap: spacing.md,
  },
  headline: {
    ...typography.sectionTitle,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  subline: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 300,
  },
  cta: {
    backgroundColor: colors.orange,
    borderRadius: radius.button,
    height: CTA_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    marginTop: spacing.lg,
  },
  ctaPressed: {
    opacity: pressedState.opacity,
    transform: pressedState.transform as unknown as { scale: number }[],
  },
  ctaText: {
    ...typography.button,
    color: colors.background,
  },
});
