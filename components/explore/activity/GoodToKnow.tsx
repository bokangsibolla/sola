import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface GoodToKnowProps {
  considerations: string[];
}

const GoodToKnow: React.FC<GoodToKnowProps> = ({ considerations }) => {
  if (!considerations || considerations.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>GOOD TO KNOW</Text>
      <View style={styles.card}>
        {considerations.map((item, index) => (
          <View key={index} style={styles.row}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={colors.textMuted}
              style={styles.icon}
            />
            <Text style={styles.text}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export { GoodToKnow };

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
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  icon: {
    marginTop: 2,
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    flex: 1,
  },
});
