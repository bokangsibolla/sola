import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { colors, fonts, spacing } from '@/constants/design';

interface GoodToKnowProps {
  considerations: string[];
}

const GoodToKnow: React.FC<GoodToKnowProps> = ({ considerations }) => {
  if (!considerations || considerations.length === 0) return null;

  return (
    <View style={styles.container}>
      <SolaText style={styles.sectionLabel}>GOOD TO KNOW</SolaText>
      <View style={styles.list}>
        {considerations.map((item, index) => (
          <View key={index} style={styles.row}>
            <View style={styles.dot} />
            <SolaText style={styles.text}>{item}</SolaText>
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
  list: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.textMuted,
    marginTop: 7,
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    flex: 1,
  },
});
