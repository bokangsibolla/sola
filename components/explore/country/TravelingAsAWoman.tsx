import { StyleSheet, Text, View } from 'react-native';
import type { Country } from '@/data/types';
import { colors, fonts, spacing } from '@/constants/design';

interface Props {
  country: Country;
}

function cleanMarkdown(md: string): string {
  return md
    .replace(/^#+\s.*/gm, '')
    .replace(/\*\*/g, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function TravelingAsAWoman({ country }: Props) {
  const raw = country.safetyWomenMd ?? country.cultureEtiquetteMd;
  if (!raw) return null;

  return (
    <View style={styles.container}>
      <View style={styles.divider} />
      <Text style={styles.heading}>Traveling Here as a Woman</Text>
      <Text style={styles.body}>{cleanMarkdown(raw)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSubtle,
    marginBottom: spacing.xl,
  },
  heading: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.textPrimary,
    lineHeight: 30,
    marginBottom: spacing.lg,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 24,
  },
});
