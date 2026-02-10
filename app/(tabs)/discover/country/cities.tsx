import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCitiesByCountry } from '@/data/api';
import type { City } from '@/data/types';
import { useData } from '@/hooks/useData';
import LoadingScreen from '@/components/LoadingScreen';
import { colors, fonts, radius, spacing, pressedState } from '@/constants/design';

function CityListCard({ city }: { city: City }) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push(`/(tabs)/discover/city/${city.slug}` as any)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {city.heroImageUrl ? (
        <Image source={{ uri: city.heroImageUrl }} style={styles.cardImage} contentFit="cover" transition={200} />
      ) : (
        <View style={[styles.cardImage, styles.cardPlaceholder]} />
      )}
      <View style={styles.cardBody}>
        <Text style={styles.cardName}>{city.name}</Text>
        {city.shortBlurb && (
          <Text style={styles.cardBlurb} numberOfLines={2}>{city.shortBlurb}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} style={styles.cardChevron} />
    </Pressable>
  );
}

export default function CountryCitiesScreen() {
  const { countryId, countryName } = useLocalSearchParams<{
    countryId: string;
    countryName: string;
    countrySlug: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: cities, loading } = useData(
    () => countryId ? getCitiesByCountry(countryId) : Promise.resolve([]),
    ['allCitiesByCountry', countryId],
  );

  if (loading) return <LoadingScreen />;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
          <Text style={styles.backLabel}>{countryName || 'Back'}</Text>
        </Pressable>
      </View>
      <Text style={styles.screenTitle}>Cities in {countryName}</Text>
      <FlatList
        data={cities ?? []}
        keyExtractor={(city) => city.slug}
        renderItem={({ item }) => <CityListCard city={item} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  nav: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  backLabel: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  screenTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.md,
    backgroundColor: colors.background,
  },
  cardPressed: {
    opacity: pressedState.opacity,
    transform: [...pressedState.transform],
  },
  cardImage: {
    width: 80,
    height: 80,
  },
  cardPlaceholder: {
    backgroundColor: colors.neutralFill,
  },
  cardBody: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  cardName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  cardBlurb: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  cardChevron: {
    marginRight: spacing.md,
  },
});
