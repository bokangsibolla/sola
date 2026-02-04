// components/explore/sections/CountryPairSection.tsx
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { spacing } from '@/constants/design';
import { CountryCard, COUNTRY_CARD_GAP } from '../cards';
import type { Country } from '@/data/types';

interface CountryPairSectionProps {
  countries: [Country, Country];
}

export function CountryPairSection({ countries }: CountryPairSectionProps) {
  const router = useRouter();

  const handlePress = (country: Country) => {
    router.push(`/(tabs)/explore/country/${country.slug}`);
  };

  return (
    <View style={styles.container}>
      <CountryCard country={countries[0]} onPress={() => handlePress(countries[0])} />
      <CountryCard country={countries[1]} onPress={() => handlePress(countries[1])} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenX,
    gap: COUNTRY_CARD_GAP,
  },
});
