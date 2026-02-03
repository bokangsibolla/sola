import { useState, useMemo } from 'react';
import {
  Dimensions,
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
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import {
  getCountries,
  getCountryContent,
  getCountriesByTags,
  searchDestinations,
} from '@/data/api';
import { useData } from '@/hooks/useData';
import type { Country, GeoContent } from '@/data/types';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SMALL_CARD_WIDTH = 140;

const TABS: { key: string; label: string; tags: string[] }[] = [
  { key: 'for_you', label: 'For you', tags: [] },
  { key: 'beach_nature', label: 'Beach & nature', tags: ['beach_islands', 'nature_outdoors'] },
  { key: 'city_culture', label: 'City & culture', tags: ['city_culture', 'foodie'] },
  { key: 'first_solo', label: 'First solo trip', tags: ['first_solo_trip'] },
];

const SECTIONS = [
  { title: 'Perfect for a first solo trip', tags: ['first', 'solo', 'beginner', 'easy'] },
  { title: 'Beach & island escapes', tags: ['beach', 'island', 'diving', 'snorkel'] },
  { title: 'City & culture', tags: ['city', 'culture', 'history', 'art'] },
  { title: 'Wellness retreats', tags: ['wellness', 'yoga', 'spa', 'retreat'] },
];

type CountryWithContent = { country: Country; content: GeoContent | undefined };

function matchesSection(content: GeoContent | undefined, sectionTags: string[]): boolean {
  if (!content?.goodForInterests?.length) return false;
  const interests = content.goodForInterests.map((i) => i.toLowerCase());
  return sectionTags.some((tag) =>
    interests.some((interest) => interest.includes(tag)),
  );
}

export default function ExploreScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('for_you');

  const { data: countries, loading, error, refetch } = useData(() => getCountries());

  const { data: countriesWithContent } = useData(
    async () => {
      const list = countries ?? [];
      const contents = await Promise.all(list.map((c) => getCountryContent(c.id)));
      return list.map((c, i) => ({ country: c, content: contents[i] }));
    },
    [countries],
  );

  const currentTabDef = TABS.find((t) => t.key === activeTab) ?? TABS[0];
  const { data: filteredCountries, loading: filterLoading } = useData(
    () =>
      activeTab !== 'for_you' && currentTabDef.tags.length > 0
        ? getCountriesByTags(currentTabDef.tags)
        : Promise.resolve(null),
    [activeTab],
  );

  const debouncedSearch = search.trim();
  const { data: searchResults, loading: searchLoading } = useData(
    () => (debouncedSearch ? searchDestinations(debouncedSearch) : Promise.resolve(null)),
    [debouncedSearch],
  );

  const isSearching = debouncedSearch.length > 0;

  // For-you section data
  const allItems = countriesWithContent ?? [];
  const heroItem = allItems[0] ?? null;

  const sectionData = useMemo(() => {
    return SECTIONS.map((section) => ({
      ...section,
      items: allItems.filter((item) => matchesSection(item.content, section.tags)),
    }));
  }, [allItems]);

  // Countries that appear in at least one section
  const sectionCountryIds = useMemo(() => {
    const ids = new Set<string>();
    sectionData.forEach((s) => s.items.forEach((item) => ids.add(item.country.id)));
    if (heroItem) ids.add(heroItem.country.id);
    return ids;
  }, [sectionData, heroItem]);

  const remainingCountries = useMemo(
    () => allItems.filter((item) => !sectionCountryIds.has(item.country.id)),
    [allItems, sectionCountryIds],
  );

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;

  const navigateToCountry = (slug: string) => {
    router.push(`/(tabs)/explore/country/${slug}`);
  };

  const renderSmallCard = (item: CountryWithContent) => (
    <Pressable
      key={item.country.id}
      style={styles.smallCard}
      onPress={() => navigateToCountry(item.country.slug)}
    >
      <View style={styles.smallCardImageWrap}>
        {item.country.heroImageUrl && (
          <Image
            source={{ uri: item.country.heroImageUrl }}
            style={styles.smallCardImage}
            contentFit="cover"
            transition={200}
          />
        )}
      </View>
      <Text style={styles.smallCardName} numberOfLines={1}>
        {item.country.name}
      </Text>
      {item.content?.subtitle && (
        <Text style={styles.smallCardSubtitle} numberOfLines={1}>
          {item.content.subtitle}
        </Text>
      )}
    </Pressable>
  );

  const renderFullWidthCard = (item: CountryWithContent) => (
    <Pressable
      key={item.country.slug}
      style={styles.guideCard}
      onPress={() => navigateToCountry(item.country.slug)}
    >
      {item.country.heroImageUrl && (
        <Image
          source={{ uri: item.country.heroImageUrl }}
          style={styles.guideImage}
          contentFit="cover"
          transition={200}
        />
      )}
      <View style={styles.guideOverlay}>
        <Text style={styles.guideName}>{item.country.name}</Text>
        {item.content?.subtitle && (
          <Text style={styles.guideSubtitle}>{item.content.subtitle}</Text>
        )}
      </View>
    </Pressable>
  );

  const renderForYouTab = () => (
    <>
      {/* Hero card */}
      {heroItem && (
        <Pressable
          style={styles.heroCard}
          onPress={() => navigateToCountry(heroItem.country.slug)}
        >
          {heroItem.country.heroImageUrl && (
            <Image
              source={{ uri: heroItem.country.heroImageUrl }}
              style={styles.heroImage}
              contentFit="cover"
              transition={200}
            />
          )}
          <View style={styles.heroOverlay}>
            <Text style={styles.heroName}>{heroItem.country.name}</Text>
            {heroItem.content?.subtitle && (
              <Text style={styles.heroSubtitle}>{heroItem.content.subtitle}</Text>
            )}
          </View>
        </Pressable>
      )}

      {/* Themed sections */}
      {sectionData.map((section) =>
        section.items.length > 0 ? (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sectionScroll}
            >
              {section.items.map(renderSmallCard)}
            </ScrollView>
          </View>
        ) : null,
      )}

      {/* Remaining countries */}
      {remainingCountries.length > 0 && (
        <View style={styles.remainingSection}>
          {remainingCountries.map(renderFullWidthCard)}
        </View>
      )}
    </>
  );

  const renderFilteredTab = () => {
    if (filterLoading) return <LoadingScreen />;
    if (!filteredCountries || filteredCountries.length === 0) {
      return (
        <Text style={styles.emptyText}>No destinations yet for this category</Text>
      );
    }
    return (
      <>
        {filteredCountries.map((country) => {
          const withContent = allItems.find((item) => item.country.id === country.id);
          return renderFullWidthCard(
            withContent ?? { country, content: undefined },
          );
        })}
      </>
    );
  };

  return (
    <AppScreen>
      <AppHeader title="Explore" subtitle="Country guides and travel inspiration" />
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
          searchLoading ? (
            <LoadingScreen />
          ) : searchResults && searchResults.length > 0 ? (
            searchResults.map((result) => (
              <Pressable
                key={`${result.type}-${result.id}`}
                style={styles.searchItem}
                onPress={() => {
                  if (result.type === 'country') {
                    router.push(`/(tabs)/explore/country/${result.slug}`);
                  } else {
                    router.push(`/(tabs)/explore/place/${result.slug}`);
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
            ))
          ) : (
            <Text style={styles.noResults}>No results for &quot;{search}&quot;</Text>
          )
        ) : (
          <>
            {/* Tabs */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabBar}
            >
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <Pressable
                    key={tab.key}
                    style={[styles.tab, isActive ? styles.tabActive : styles.tabInactive]}
                    onPress={() => setActiveTab(tab.key)}
                  >
                    <Text style={[styles.tabText, isActive ? styles.tabTextActive : styles.tabTextInactive]}>
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Tab content */}
            {activeTab === 'for_you' ? renderForYouTab() : renderFilteredTab()}
          </>
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  tabBar: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  tabActive: {
    backgroundColor: colors.textPrimary,
  },
  tabInactive: {
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  tabText: {
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  tabTextActive: {
    color: colors.background,
  },
  tabTextInactive: {
    color: colors.textPrimary,
  },
  heroCard: {
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    height: 260,
    backgroundColor: colors.borderSubtle,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.overlayDark,
  },
  heroName: {
    fontFamily: fonts.semiBold,
    fontSize: 26,
    color: '#FFFFFF',
  },
  heroSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  sectionScroll: {
    gap: spacing.md,
  },
  smallCard: {
    width: SMALL_CARD_WIDTH,
  },
  smallCardImageWrap: {
    width: SMALL_CARD_WIDTH,
    height: SMALL_CARD_WIDTH,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.borderSubtle,
    marginBottom: spacing.sm,
  },
  smallCardImage: {
    width: '100%',
    height: '100%',
  },
  smallCardName: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
  smallCardSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  remainingSection: {
    marginTop: spacing.sm,
  },
  guideCard: {
    borderRadius: radius.card,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    height: 200,
    backgroundColor: colors.borderSubtle,
  },
  guideImage: {
    width: '100%',
    height: '100%',
  },
  guideOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: colors.overlayDark,
  },
  guideName: {
    fontFamily: fonts.semiBold,
    fontSize: 22,
    color: '#FFFFFF',
  },
  guideSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
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
});
