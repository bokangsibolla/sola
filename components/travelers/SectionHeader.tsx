import { StyleSheet, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/design';
import { SolaText } from '@/components/ui/SolaText';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export default function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <View style={styles.container}>
      <SolaText style={styles.title}>{title}</SolaText>
      {subtitle && <SolaText style={styles.subtitle}>{subtitle}</SolaText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
});
