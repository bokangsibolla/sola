import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Country, PlaceWithCity } from '@/data/types';
import { colors, fonts, spacing } from '@/constants/design';
import { PlaceHorizontalCard } from '@/components/explore/country/PlaceHorizontalCard';

interface Props {
  country: Country;
  places: PlaceWithCity[];
}

function cleanMarkdown(md: string): string {
  return md
    .replace(/^#+\s.*/gm, '')
    .replace(/\*\*/g, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function HealthAccessSection({ country, places }: Props) {
  const raw = country.healthAccessMd;
  if (!raw) return null;

  return (
    <View style={styles.container}>
      <View style={styles.divider} />
      <Text style={styles.heading}>Your health here</Text>
      <Text style={styles.body}>{cleanMarkdown(raw)}</Text>
      {places.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScroll}
          style={styles.scrollContainer}
        >
          {places.map((place) => (
            <PlaceHorizontalCard key={place.id} place={place} />
          ))}
        </ScrollView>
      )}
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
    fontFamily: fonts.semiBold,
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
  scrollContainer: {
    marginTop: spacing.lg,
  },
  horizontalScroll: {
    paddingRight: spacing.lg,
  },
});
