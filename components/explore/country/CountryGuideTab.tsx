import { ScrollView, StyleSheet, View } from 'react-native';
import { colors, spacing } from '@/constants/design';
import type { Country, PlaceWithCity } from '@/data/types';
import { WhyWomenLoveIt } from './WhyWomenLoveIt';
import { TravelFitSection } from './TravelFitSection';
import { KnowBeforeYouGoAccordion } from './KnowBeforeYouGoAccordion';

interface Props {
  country: Country;
  healthPlaces: PlaceWithCity[];
}

export function CountryGuideTab({ country, healthPlaces }: Props) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <WhyWomenLoveIt country={country} />

      <TravelFitSection country={country} />

      <KnowBeforeYouGoAccordion country={country} healthPlaces={healthPlaces} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxxl,
  },
});
