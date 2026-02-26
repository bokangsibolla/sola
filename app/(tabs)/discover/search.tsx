// app/(tabs)/discover/search.tsx
import { useState, useEffect, useRef, useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
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
      .catch((err) => console.warn('[Sola Search] Popular cities failed:', err?.message));
  }, []);

  const browseCategories = [
    { label: 'Cities', icon: 'map-pin' as const, route: '/discover/all-destinations' as const },
    { label: 'Countries', icon: 'globe' as const, route: '/discover/all-countries' as const },
    { label: 'Activities', icon: 'compass' as const, route: '/discover/all-activities' as const },
    { label: 'Volunteer', icon: 'heart' as const, route: '/discover/volunteer' as const },
  ];

  const suggestions = [
    'Bangkok',
    'Female-only stays',
    'Chiang Mai',
    'Volunteer',
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
      volunteer: 'Volunteer',
    };
    const order: SearchResult['type'][] = ['country', 'city', 'area', 'activity', 'volunteer'];

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
      case 'volunteer':
        router.push(`/(tabs)/discover/place-detail/${result.id}`);
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
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultContext}>{item.context}</Text>
      </View>
      <Text style={styles.resultType}>{item.type}</Text>
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
              <Text style={styles.sectionTitle}>RECENT</Text>
              <View style={styles.recentList}>
                {recentSearches.map((term) => (
                  <Pressable
                    key={term}
                    style={styles.recentChip}
                    onPress={() => handleRecentPress(term)}
                  >
                    <Text style={styles.recentText}>{term}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Section 2: Browse by */}
          <View style={styles.sectionNoPadX}>
            <Text style={[styles.sectionTitle, { paddingHorizontal: spacing.screenX }]}>BROWSE BY</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.browseRow}
            >
              {browseCategories.map((cat) => (
                <Pressable
                  key={cat.label}
                  style={styles.browseChip}
                  onPress={() => router.push(cat.route)}
                >
                  <Feather name={cat.icon} size={14} color={colors.orange} />
                  <Text style={styles.browseChipText}>{cat.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Section 3: Popular destinations */}
          {popularCities.length > 0 && (
            <View style={styles.sectionNoPadX}>
              <Text style={[styles.sectionTitle, { paddingHorizontal: spacing.screenX }]}>
                POPULAR DESTINATIONS
              </Text>
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
                    <Text style={styles.popularCityName} numberOfLines={1}>
                      {city.name}
                    </Text>
                    <Text style={styles.popularCountryName} numberOfLines={1}>
                      {city.countryName}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Section 4: Try searching for */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TRY SEARCHING FOR</Text>
            <View style={styles.suggestionList}>
              {suggestions.map((term) => (
                <Pressable
                  key={term}
                  style={styles.suggestionChip}
                  onPress={() => setQuery(term)}
                >
                  <Feather name="search" size={12} color={colors.textMuted} />
                  <Text style={styles.suggestionText}>{term}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : results.length === 0 ? (
        // No results
        <View style={styles.centered}>
          <Text style={styles.noResults}>No results for "{query}"</Text>
          <Text style={styles.noResultsHint}>
            Try searching for a country or city name.
          </Text>
        </View>
      ) : (
        // Grouped Results
        <FlatList
          data={groupedResults}
          renderItem={({ item: group }) => (
            <View>
              <Text style={styles.groupTitle}>{group.title}</Text>
              {group.data.map((result) => (
                <Pressable
                  key={`${result.type}-${result.id}`}
                  style={styles.resultRow}
                  onPress={() => handleResultPress(result)}
                >
                  <View style={styles.resultContent}>
                    <Text style={styles.resultName}>{result.name}</Text>
                    <Text style={styles.resultContext}>{result.context}</Text>
                  </View>
                  <Text style={styles.resultType}>{result.type}</Text>
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
    paddingHorizontal: spacing.screenX,
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
