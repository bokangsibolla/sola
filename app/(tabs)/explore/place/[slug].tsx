import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { mockCountryGuides, type CityGuide, type PlaceEntry } from '@/data/mock';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

function findCity(slug: string): CityGuide | undefined {
  for (const guide of mockCountryGuides) {
    const city = guide.cities.find((c) => c.slug === slug);
    if (city) return city;
  }
  return undefined;
}

export default function PlaceScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const city = findCity(slug ?? '');

  if (!city) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.notFound}>Place not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.nav}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Image source={{ uri: city.heroImageUrl }} style={styles.hero} />

        <View style={styles.content}>
          <Text style={styles.cityName}>{city.name}</Text>
          <Text style={styles.tagline}>{city.tagline}</Text>

          {/* Neighborhoods */}
          <Text style={styles.sectionTitle}>Neighborhoods</Text>
          <View style={styles.pills}>
            {city.neighborhoods.map((n) => (
              <View key={n} style={styles.pill}>
                <Text style={styles.pillText}>{n}</Text>
              </View>
            ))}
          </View>

          {/* Must-do */}
          {city.mustDo.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Must-do</Text>
              {city.mustDo.map((entry) => (
                <PlaceEntryCard key={entry.id} entry={entry} />
              ))}
            </>
          )}

          {/* Eats */}
          {city.eats.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Where to eat</Text>
              {city.eats.map((entry) => (
                <PlaceEntryCard key={entry.id} entry={entry} />
              ))}
            </>
          )}

          {/* Stays */}
          {city.stays.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Where to stay</Text>
              {city.stays.map((entry) => (
                <PlaceEntryCard key={entry.id} entry={entry} />
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function PlaceEntryCard({ entry }: { entry: PlaceEntry }) {
  return (
    <View style={styles.entryCard}>
      <Image source={{ uri: entry.imageUrl }} style={styles.entryImage} />
      <View style={styles.entryText}>
        <Text style={styles.entryName}>{entry.name}</Text>
        <Text style={styles.entryCategory}>
          {entry.category}
          {entry.priceLevel ? ` · ${entry.priceLevel}` : ''}
        </Text>
        <Text style={styles.entryDesc} numberOfLines={2}>{entry.description}</Text>
        {entry.tip && (
          <Text style={styles.entryTip}>Tip: {entry.tip}</Text>
        )}
      </View>
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
  hero: {
    width: '100%',
    height: 200,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  cityName: {
    ...typography.h1,
    color: colors.textPrimary,
  },
  tagline: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    backgroundColor: colors.orangeFill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  pillText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
  entryCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  entryImage: {
    width: 88,
    height: 88,
  },
  entryText: {
    flex: 1,
    padding: spacing.md,
  },
  entryName: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  entryCategory: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  entryDesc: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: 4,
    lineHeight: 18,
  },
  entryTip: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.orange,
    marginTop: 4,
  },
});
