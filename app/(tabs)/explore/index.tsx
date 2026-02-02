import { useState, useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppScreen from '@/components/AppScreen';
import AppHeader from '@/components/AppHeader';
import { getCountries, getCountryContent, searchDestinations } from '@/data/api';
import { useData } from '@/hooks/useData';
import LoadingScreen from '@/components/LoadingScreen';
import ErrorScreen from '@/components/ErrorScreen';
import { colors, fonts, radius, spacing, typography } from '@/constants/design';

const SAFETY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  very_safe: { bg: colors.greenFill, text: colors.greenSoft, label: 'Very Safe' },
  generally_safe: { bg: colors.blueFill, text: colors.blueSoft, label: 'Generally Safe' },
  use_caution: { bg: colors.warningFill, text: colors.warning, label: 'Use Caution' },
  exercise_caution: { bg: colors.warningFill, text: colors.warning, label: 'Exercise Caution' },
};

export default function ExploreScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const { data: countries, loading, error, refetch } = useData(() => getCountries());

  const countriesWithContent = useMemo(
    () =>
      (countries ?? []).map((c) => ({
        country: c,
        content: getCountryContent(c.id),
      })),
    [countries],
  );

  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    return searchDestinations(search);
  }, [search]);

  const isSearching = searchResults !== null;

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error.message} onRetry={refetch} />;

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
          searchResults.length > 0 ? (
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
            <Text style={styles.noResults}>No results for "{search}"</Text>
          )
        ) : (
          countriesWithContent.map(({ country, content }) => {
            const safety = content ? SAFETY_COLORS[content.safetyRating] : null;
            return (
              <Pressable
                key={country.slug}
                style={styles.guideCard}
                onPress={() => router.push(`/(tabs)/explore/country/${country.slug}`)}
              >
                {country.heroImageUrl && (
                  <Image source={{ uri: country.heroImageUrl }} style={styles.guideImage} />
                )}
                <View style={styles.guideOverlay}>
                  <Text style={styles.guideName}>{country.name}</Text>
                  {content?.subtitle && (
                    <Text style={styles.guideSubtitle}>{content.subtitle}</Text>
                  )}
                  <View style={styles.guideMeta}>
                    {safety && (
                      <View style={[styles.badge, { backgroundColor: safety.bg }]}>
                        <Text style={[styles.badgeText, { color: safety.text }]}>
                          {safety.label}
                        </Text>
                      </View>
                    )}
                    {content?.soloFriendly && (
                      <View style={[styles.badge, { backgroundColor: colors.orangeFill }]}>
                        <Text style={[styles.badgeText, { color: colors.orange }]}>
                          Solo-friendly
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })
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
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
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
  guideMeta: {
    flexDirection: 'row',
    gap: 6,
    marginTop: spacing.sm,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
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
