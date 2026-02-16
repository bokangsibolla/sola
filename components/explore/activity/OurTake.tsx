import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/design';

interface OurTakeProps {
  bullets: string[];
  fallbackText: string | null;
}

const OurTake: React.FC<OurTakeProps> = ({ bullets, fallbackText }) => {
  const hasBullets = bullets && bullets.length > 0;
  const hasFallback = fallbackText && fallbackText.trim().length > 0;

  if (!hasBullets && !hasFallback) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>WHY WE INCLUDE THIS</Text>
      {hasBullets ? (
        <View style={styles.bulletList}>
          {bullets.slice(0, 6).map((bullet, index) => (
            <View key={index} style={styles.bulletRow}>
              <View style={styles.bulletDot} />
              <Text style={styles.bulletText}>{bullet}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.accentRow}>
          <View style={styles.accentBar} />
          <Text style={styles.proseText}>{fallbackText}</Text>
        </View>
      )}
    </View>
  );
};

export { OurTake };

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xxl,
  },
  sectionLabel: {
    fontFamily: fonts.medium,
    fontSize: 11,
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },
  bulletList: {
    gap: spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.orange,
    marginTop: 8,
  },
  bulletText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textPrimary,
    flex: 1,
  },
  accentRow: {
    flexDirection: 'row',
  },
  accentBar: {
    width: 2,
    backgroundColor: colors.orange,
    opacity: 0.3,
    borderRadius: 1,
    marginRight: spacing.md,
    marginTop: 2,
    marginBottom: 2,
  },
  proseText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textSecondary,
    flex: 1,
  },
});
