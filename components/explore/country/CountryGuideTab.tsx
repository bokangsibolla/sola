import { StyleSheet, View } from 'react-native';
import { spacing } from '@/constants/design';
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
    <View style={styles.content}>
      <WhyWomenLoveIt country={country} />

      <TravelFitSection country={country} />

      <KnowBeforeYouGoAccordion country={country} healthPlaces={healthPlaces} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxxl,
  },
});
