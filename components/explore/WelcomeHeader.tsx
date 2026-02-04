// components/explore/WelcomeHeader.tsx
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, spacing } from '@/constants/design';

interface WelcomeHeaderProps {
  title: string;
  subtitle?: string;
}

export default function WelcomeHeader({ title, subtitle }: WelcomeHeaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <View style={styles.accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 22,
  },
  accent: {
    width: 40,
    height: 3,
    backgroundColor: colors.orange,
    borderRadius: 2,
    marginTop: spacing.md,
  },
});
