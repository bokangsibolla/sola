// app/(tabs)/discover/search.tsx
import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SolaText } from '@/components/ui/SolaText';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { eventTracker } from '@/data/events/eventTracker';
import { colors, fonts, spacing, radius } from '@/constants/design';
import BackButton from '@/components/ui/BackButton';
import { useSearch, SearchResult } from '@/data/explore';
import { getPopularCitiesWithCountry } from '@/data/api';
import type { CityWithCountry } from '@/data/explore/types';

export default function SearchScreen() {
  const router = useRouter();
  const posthog = usePostHog();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const {
    query,
    setQuery,
    results,
    isSearching,
    recentSearches,
    addRecentSearch,
  } = useSearch();

  const [popularCities, setPopularCities] = useState<CityWithCountry[]>([]);

  useEffect(() => {
    getPopularCitiesWithCountry(6)
      .then(setPopularCities)
      .catch(() => {});
  }, []);

  const browseCategories = [
    { label: 'Cities', icon: 'map-pin' as const, route: '/discover/all-destinations' as const },
    { label: 'Countries', icon: 'globe' as const, route: '/discover/all-countries' as const },
    { label: 'Activities', icon: 'compass' as const, route: '/discover/all-activities' as const },
  ];

  const suggestions = [
    'Bangkok',
    'Female-only stays',
    'Chiang Mai',
    'Yoga retreat',
    'Bali beaches',
    'Night markets',
  ];

  const groupedResults = useMemo(() => {
    const groups: { title: string; type: string; data: SearchResult[] }[] = [];
    const typeLabels: Record<string, string> = {
      country: 'Countries',
      city: 'Cities',
      area: 'Areas',
      activity: 'Activities',
    };
    const order: SearchResult['type'][] = ['country', 'city', 'area', 'activity'];

    for (const type of order) {
      const items = results.filter((r) => r.type === type);
      if (items.length > 0) {
        groups.push({ title: typeLabels[type] ?? type, type, data: items });
      }
    }

    return groups;
  }, [results]);

  useEffect(() => {
    // Auto-focus input on mount
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleBack = () => {
    Keyboard.dismiss();
    router.back();
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  const handleResultPress = (result: SearchResult) => {
    posthog.capture('search_result_selected', {
      type: result.type,
      name: result.name,
      query,
    });
    addRecentSearch(result.name);
    eventTracker.track('searched', null, null, { query, result_type: result.type, result_name: result.name });

    switch (result.type) {
      case 'country':
        router.push(`/(tabs)/discover/country/${result.slug}`);
        break;
      case 'city':
        router.push(`/(tabs)/discover/city/${result.slug}`);
        break;
      case 'area':
        router.push(`/(tabs)/discover/city/${result.slug}`);
        break;
      case 'activity':
        router.push(`/(tabs)/discover/activity/${result.slug}`);
        break;
    }
  };

  const handleRecentPress = (term: string) => {
    setQuery(term);
  };

  const renderResult = ({ item }: { item: SearchResult }) => (
    <Pressable
      style={styles.resultRow}
      onPress={() => handleResultPress(item)}
    >
      <View style={styles.resultContent}>
        <SolaText style={styles.resultName}>{item.name}</SolaText>
        <SolaText style={styles.resultContext}>{item.context}</SolaText>
      </View>
      <SolaText style={styles.resultType}>{item.type}</SolaText>
    </Pressable>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={handleBack} />

        <View style={styles.inputContainer}>
          <Feather name="search" size={17} color={colors.orange} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Search destinations, stays, experiences"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            autoCorrect={false}
            selectionColor={colors.orange}
          />
          {query.length > 0 && (
            <Pressable onPress={handleClear} hitSlop={8}>
              <Feather name="x-circle" size={17} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Content */}
      {isSearching ? (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color={colors.orange} />
        </View>
      ) : query.length === 0 ? (
        // Discovery experience
        <ScrollView
          contentContainerStyle={styles.discoveryContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Section 1: Recent searches */}
          {recentSearches.length > 0 && (
            <View style={styles.section}>
              <SolaText style={styles.sectionTitle}>RECENT</SolaText>
              <View style={styles.recentList}>
                {recentSearches.map((term) => (
                  <Pressable
                    key={term}
                    style={styles.recentChip}
                    onPress={() => handleRecentPress(term)}
                  >
                    <SolaText style={styles.recentText}>{term}</SolaText>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Section 2: Browse by */}
          <View style={styles.section}>
            <SolaText style={styles.sectionTitle}>BROWSE BY</SolaText>
            <View style={styles.browseRow}>
              {browseCategories.map((cat) => (
                <Pressable
                  key={cat.label}
                  style={styles.browseChip}
                  onPress={() => router.push(cat.route)}
                >
                  <Feather name={cat.icon} size={14} color={colors.orange} />
                  <SolaText style={styles.browseChipText}>{cat.label}</SolaText>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Section 3: Popular destinations */}
          {popularCities.length > 0 && (
            <View style={styles.sectionNoPadX}>
              <SolaText style={[styles.sectionTitle, { paddingHorizontal: spacing.screenX }]}>
                POPULAR DESTINATIONS
              </SolaText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.popularRow}
              >
                {popularCities.map((city) => (
                  <Pressable
                    key={city.slug}
                    style={styles.popularCard}
                    onPress={() => {
                      addRecentSearch(city.name);
                      router.push(`/(tabs)/discover/city/${city.slug}`);
                    }}
                  >
                    {city.heroImageUrl ? (
                      <Image
                        source={{ uri: city.heroImageUrl }}
                        style={styles.popularImage}
                        contentFit="cover"
                        transition={200}
                      />
                    ) : (
                      <View style={[styles.popularImage, { backgroundColor: colors.neutralFill }]} />
                    )}
                    <SolaText style={styles.popularCityName} numberOfLines={1}>
                      {city.name}
                    </SolaText>
                    <SolaText style={styles.popularCountryName} numberOfLines={1}>
                      {city.countryName}
                    </SolaText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Section 4: Try searching for */}
          <View style={styles.section}>
            <SolaText style={styles.sectionTitle}>TRY SEARCHING FOR</SolaText>
            <View style={styles.suggestionList}>
              {suggestions.map((term) => (
                <Pressable
                  key={term}
                  style={styles.suggestionChip}
                  onPress={() => setQuery(term)}
                >
                  <Feather name="search" size={12} color={colors.textMuted} />
                  <SolaText style={styles.suggestionText}>{term}</SolaText>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : results.length === 0 ? (
        // No results
        <View style={styles.centered}>
          <SolaText style={styles.noResults}>No results for "{query}"</SolaText>
          <SolaText style={styles.noResultsHint}>
            Try searching for a country or city name.
          </SolaText>
        </View>
      ) : (
        // Grouped Results
        <FlatList
          data={groupedResults}
          renderItem={({ item: group }) => (
            <View>
              <SolaText style={styles.groupTitle}>{group.title}</SolaText>
              {group.data.map((result) => (
                <Pressable
                  key={`${result.type}-${result.id}`}
                  style={styles.resultRow}
                  onPress={() => handleResultPress(result)}
                >
                  <View style={styles.resultContent}>
                    <SolaText style={styles.resultName}>{result.name}</SolaText>
                    <SolaText style={styles.resultContext}>{result.context}</SolaText>
                  </View>
                  <SolaText style={styles.resultType}>{result.type}</SolaText>
                </Pressable>
              ))}
            </View>
          )}
          keyExtractor={(group) => group.type}
          contentContainerStyle={styles.results}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderDefault,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: 2,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  section: {
    padding: spacing.screenX,
  },
  sectionTitle: {
    fontFamily: fonts.medium,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  recentList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  recentChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
  },
  recentText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
  },
  results: {
    paddingVertical: spacing.md,
  },
  groupTitle: {
    fontFamily: fonts.medium,
    fontSize: 12,
    letterSpacing: 1,
    color: colors.textMuted,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.screenX,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.lg,
  },
  resultContent: {
    flex: 1,
  },
  resultName: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textPrimary,
  },
  resultContext: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  resultType: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },
  noResults: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  noResultsHint: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  // Discovery empty state
  discoveryContent: {
    paddingVertical: spacing.lg,
    gap: spacing.xl,
  },
  sectionNoPadX: {
    // section without horizontal padding (for horizontal scroll)
  },
  browseRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  browseChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.orangeFill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  browseChipText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.orange,
  },
  popularRow: {
    paddingHorizontal: spacing.screenX,
    gap: spacing.md,
  },
  popularCard: {
    width: 120,
  },
  popularImage: {
    width: 120,
    height: 90,
    borderRadius: radius.md,
  },
  popularCityName: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  popularCountryName: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  suggestionList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.neutralFill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  suggestionText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
