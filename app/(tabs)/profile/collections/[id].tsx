import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockCollections, mockCountryGuides, type PlaceEntry } from '@/data/mock';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

function findPlaceById(id: string): PlaceEntry | undefined {
  for (const guide of mockCountryGuides) {
    for (const city of guide.cities) {
      const allEntries = [...city.mustDo, ...city.eats, ...city.stays];
      const found = allEntries.find((e) => e.id === id);
      if (found) return found;
    }
  }
  return undefined;
}

export default function CollectionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const collection = mockCollections.find((c) => c.id === id);

  if (!collection) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>Collection not found</Text>
      </View>
    );
  }

  const places = collection.placeIds
    .map(findPlaceById)
    .filter(Boolean) as PlaceEntry[];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.emoji}>{collection.emoji}</Text>
        <Text style={styles.title}>{collection.name}</Text>
        <Text style={styles.count}>
          {places.length} {places.length === 1 ? 'place' : 'places'}
        </Text>

        {places.map((place) => (
          <View key={place.id} style={styles.placeCard}>
            <Text style={styles.placeName}>{place.name}</Text>
            <Text style={styles.placeCategory}>
              {place.category}
              {place.priceLevel ? ` · ${place.priceLevel}` : ''}
            </Text>
            <Text style={styles.placeDesc}>{place.description}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  notFound: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  nav: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  count: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  placeCard: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  placeName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  placeCategory: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  placeDesc: {
    ...typography.body,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
});
