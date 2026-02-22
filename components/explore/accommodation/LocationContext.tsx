import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { colors, fonts, radius, spacing } from '@/constants/design';

interface LocationContextProps {
  text: string | null;
}

const LocationContext: React.FC<LocationContextProps> = ({ text }) => {
  if (!text) return null;

  return (
    <View style={styles.container}>
      <SolaText style={styles.sectionLabel}>NEIGHBORHOOD</SolaText>
      <View style={styles.card}>
        <SolaText style={styles.text}>{text}</SolaText>
      </View>
    </View>
  );
};

export { LocationContext };

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
    padding: spacing.xl,
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
});
