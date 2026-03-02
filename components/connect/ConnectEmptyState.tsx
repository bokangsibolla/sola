import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius } from '@/constants/design';

interface ConnectEmptyStateProps {
  cityName: string;
  onPost: () => void;
}

export const ConnectEmptyState: React.FC<ConnectEmptyStateProps> = ({
  cityName,
  onPost,
}) => (
  <View style={styles.container}>
    <Ionicons name="people-outline" size={48} color={colors.textMuted} />

    <Text style={styles.title}>Nothing happening in {cityName} yet</Text>

    <Text style={styles.subtitle}>
      Be the first — post an activity and other women here will see it.
    </Text>

    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
      ]}
      onPress={onPost}
    >
      <Text style={styles.buttonText}>Post an activity</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.xxxxl,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  button: {
    borderWidth: 1,
    borderColor: colors.orange,
    borderRadius: radius.button,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginTop: spacing.xl,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.orange,
  },
});
