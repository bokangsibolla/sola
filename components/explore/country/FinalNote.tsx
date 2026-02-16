import { StyleSheet, Text, View } from 'react-native';
import type { Country } from '@/data/types';
import { colors, fonts, spacing } from '@/constants/design';

interface Props {
  country: Country;
}

export function FinalNote({ country }: Props) {
  if (!country.finalNoteMd) return null;

  const text = country.finalNoteMd
    .replace(/^#+\s.*/gm, '')
    .replace(/\*\*/g, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .split(/\n\n+/)
    .map((p) => p.replace(/\n/g, ' ').trim())
    .filter((p) => p.length > 0);

  if (text.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.divider} />
      <Text style={styles.heading}>Final note</Text>
      {text.map((p, i) => (
        <Text key={i} style={styles.body}>{p}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.screenX,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginBottom: spacing.xl,
  },
  heading: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 26,
    marginBottom: spacing.md,
  },
});
