import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePostHog } from 'posthog-react-native';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import {
  getCountries,
  getCountryContent,
  getPopularCities,
  getCityContent,
  getCountryById,
  searchDestinations,
} from '@/data/api';
import { useData } from '@/hooks/useData';
import type { Country, City, GeoContent } from '@/data/types';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CountryWithContent = { country: Country; content: GeoContent | undefined };
type CityWithContext = { city: City; countryName: string; content: GeoContent | undefined };

// ---------------------------------------------------------------------------
// City Card Component
// ---------------------------------------------------------------------------

function CityCard({ city, countryName, content }: CityWithContext) {
  const router = useRouter();
  const posthog = usePostHog();

  return (
    <Pressable
      style={styles.cityCard}
      onPress={() => {
        posthog.capture('city_tapped', { city_slug: city.slug, city_name: city.name });
        router.push(`/(tabs)/explore/city/${city.slug}` as any);
      }}
    >
      {city.heroImageUrl ? (
        <Image source={{ uri: city.heroImageUrl }} style={styles.cityImage} contentFit="cover" transition={200} />
      ) : (
        <View style={[styles.cityImage, styles.cityImagePlaceholder]} />
      )}
      <View style={styles.cityBody}>
        <Text style={styles.cityName} numberOfLines={1}>{city.name}</Text>
        <Text style={styles.cityCountry} numberOfLines={1}>{countryName}</Text>
        {content?.bestFor && (
          <View style={styles.cityBestFor}>
            <Text style={styles.cityBestForText} numberOfLines={1}>{content.bestFor}</Text>
          </View>
        )}
      </View>
      <View style={styles.cityArrowContainer}>
        <Ionicons name="chevron-forward" size={14} color={colors.orange} />
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Country Card Component
// ---------------------------------------------------------------------------

function CountryCard({ country, content }: CountryWithContent) {
  const router = useRouter();
  const posthog = usePostHog();

  return (
    <Pressable
      style={styles.countryCard}
      onPress={() => {
        posthog.capture('country_guide_tapped', { country_slug: country.slug });
        router.push(`/(tabs)/explore/country/${country.slug}` as any);
      }}
    >
      {country.heroImageUrl ? (
        <Image source={{ uri: country.heroImageUrl }} style={styles.countryImage} contentFit="cover" transition={200} />
      ) : (
        <View style={[styles.countryImage, styles.countryImagePlaceholder]} />
      )}
      <View style={styles.countryOverlay}>
        <Text style={styles.countryName}>{country.name}</Text>
        {content?.subtitle && (
          <Text style={styles.countrySubtitle} numberOfLines={1}>{content.subtitle}</Text>
        )}
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Featured Country Hero
// ---------------------------------------------------------------------------

function FeaturedCountryHero({ country, content }: CountryWithContent) {
  const router = useRouter();
  const posthog = usePostHog();

  return (
    <Pressable
      style={styles.featuredHero}
      onPress={() => {
        posthog.capture('featured_country_tapped', { country_slug: country.slug });
        router.push(`/(tabs)/explore/country/${country.slug}` as any);
      }}
    >
      {country.heroImageUrl ? (
        <Image source={{ uri: country.heroImageUrl }} style={styles.featuredImage} contentFit="cover" transition={300} />
      ) : (
        <View style={[styles.featuredImage, styles.featuredImagePlaceholder]} />
      )}
      <View style={styles.featuredOverlay}>
        <Text style={styles.featuredLabel}>Featured destination</Text>
        <Text style={styles.featuredName}>{country.name}</Text>
        {content?.subtitle && (
          <Text style={styles.featuredSubtitle}>{content.subtitle}</Text>
        )}
        <View style={styles.featuredCta}>
          <Text style={styles.featuredCtaText}>Explore</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </View>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------

export default function ExploreScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const [search, setSearch] = useState('');

  useEffect(() => {
    posthog.capture('explore_screen_viewed');
  }, [posthog]);

  // Fetch countries
  const { data: countries, loading, error, refetch } = useData(() => getCountries());

  // Fetch country content
  const { data: countriesWithContent } = useData(
    async () => {
      const list = countries ?? [];
      const contents = await Promise.all(list.map((c) => getCountryContent(c.id)));
      return list.map((c, i) => ({ country: c, content: contents[i] }));
    },
    [countries],
  );

  // Fetch popular cities
  const { data: cities } = useData(() => getPopularCities(12));

  // Fetch city content and country names
  const { data: citiesWithContext } = useData(
    async (): Promise<CityWithContext[]> => {
      const list = Array.isArray(cities) ? cities : [];
      if (list.length === 0) return [];
      const results: CityWithContext[] = [];
      for (const city of list) {
        const [content, country] = await Promise.all([
          getCityContent(city.id).catch(() => undefined),
          getCountryById(city.countryId).catch(() => undefined),
        ]);
        results.push({
          city,
          countryName: country?.name ?? '',
          content: content ?? undefined,
        });
      }
      return results;
    },
    [cities],
  );

  // Search
  const debouncedSearch = search.trim();
  const { data: searchResults, loading: searchLoading } = useData(
    () => (debouncedSearch ? searchDestinations(debouncedSearch) : Promise.resolve(null)),
    [debouncedSearch],
  );

  const isSearching = debouncedSearch.length > 0;

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;

  return (
    <AppScreen>
      <AppHeader title="Explore" subtitle="Where are you dreaming of?" />
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search countries or cities..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        {isSearching ? (
          // Search Results
          searchLoading ? (
            <LoadingScreen />
          ) : searchResults && searchResults.length > 0 ? (
            <View style={styles.searchResults}>
              {searchResults.map((result) => (
                <Pressable
                  key={`${result.type}-${result.id}`}
                  style={styles.searchItem}
                  onPress={() => {
                    posthog.capture('search_result_tapped', { type: result.type, slug: result.slug });
                    if (result.type === 'country') {
                      router.push(`/(tabs)/explore/country/${result.slug}` as any);
                    } else {
                      router.push(`/(tabs)/explore/city/${result.slug}` as any);
                    }
                  }}
                >
                  <View style={styles.searchItemIcon}>
                    <Ionicons
                      name={result.type === 'country' ? 'flag' : 'location'}
                      size={18}
                      color={colors.textSecondary}
                    />
                  </View>
                  <View style={styles.searchItemText}>
                    <Text style={styles.searchItemName}>{result.name}</Text>
                    {result.parentName && (
                      <Text style={styles.searchItemParent}>{result.parentName}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                </Pressable>
              ))}
            </View>
          ) : (
            <Text style={styles.noResults}>No results for &quot;{search}&quot;</Text>
          )
        ) : (
          <>
            {/* Featured Country Hero */}
            {(countriesWithContent ?? []).length > 0 && (
              <FeaturedCountryHero
                country={countriesWithContent![0].country}
                content={countriesWithContent![0].content}
              />
            )}

            {/* Popular Cities Section */}
            {(citiesWithContext ?? []).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Jump to a city</Text>
                <Text style={styles.sectionSubtitle}>Start planning what to do</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.cityScroll}
                >
                  {(citiesWithContext ?? []).map((item) => (
                    <CityCard
                      key={item.city.id}
                      city={item.city}
                      countryName={item.countryName}
                      content={item.content}
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Countries Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Browse by country</Text>
              <Text style={styles.sectionSubtitle}>Explore cities and plan your trip</Text>
              <View style={styles.countryGrid}>
                {(countriesWithContent ?? []).slice(1).map((item) => (
                  <CountryCard
                    key={item.country.id}
                    country={item.country}
                    content={item.content}
                  />
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </AppScreen>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  searchResults: {
    gap: 0,
  },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    gap: spacing.md,
  },
  searchItemIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchItemText: {
    flex: 1,
  },
  searchItemName: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  searchItemParent: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 1,
  },
  noResults: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },

  // Sections
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: spacing.lg,
  },

  // City cards (horizontal scroll)
  cityScroll: {
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  cityCard: {
    width: 180,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  cityImage: {
    width: '100%',
    height: 110,
  },
  cityImagePlaceholder: {
    backgroundColor: colors.borderSubtle,
  },
  cityBody: {
    padding: spacing.sm,
    paddingBottom: spacing.md,
  },
  cityName: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  cityCountry: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  cityBestFor: {
    marginTop: spacing.sm,
    backgroundColor: colors.orangeFill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  cityBestForText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.orange,
  },
  cityArrowContainer: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Country cards (grid)
  countryGrid: {
    gap: spacing.md,
  },
  countryCard: {
    height: 160,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.borderSubtle,
  },
  countryImage: {
    width: '100%',
    height: '100%',
  },
  countryImagePlaceholder: {
    backgroundColor: colors.borderSubtle,
  },
  countryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.overlayDark,
  },
  countryName: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    color: '#FFFFFF',
  },
  countrySubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },

  // Featured hero
  featuredHero: {
    height: 280,
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    backgroundColor: colors.borderSubtle,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredImagePlaceholder: {
    backgroundColor: colors.borderSubtle,
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  featuredLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  featuredName: {
    fontFamily: fonts.semiBold,
    fontSize: 28,
    color: '#FFFFFF',
  },
  featuredSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
  },
  featuredCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  featuredCtaText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
});
