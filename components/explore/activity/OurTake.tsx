import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface OurTakeProps {
  bullets: string[];
  fallbackText: string | null;
  /** Override the section label. Defaults to "WHY WE INCLUDE THIS" */
  label?: string;
}

const OurTake: React.FC<OurTakeProps> = ({
  bullets,
  fallbackText,
  label = 'WHY WE INCLUDE THIS',
}) => {
  const hasBullets = bullets && bullets.length > 0;
  const hasFallback = fallbackText && fallbackText.trim().length > 0;

  if (!hasBullets && !hasFallback) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.card}>
        <View style={styles.accentBar} />
        <View style={styles.cardContent}>
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
            <Text style={styles.proseText}>{fallbackText}</Text>
          )}
        </View>
      </View>
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
  card: {
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    padding: spacing.lg,
    flexDirection: 'row',
  },
  accentBar: {
    width: 3,
    backgroundColor: colors.orange,
    borderRadius: 1.5,
    marginRight: spacing.lg,
  },
  cardContent: {
    flex: 1,
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
  proseText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});
