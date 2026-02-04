// app/(tabs)/explore/search.tsx
import { useEffect, useRef } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { useSearch, SearchResult } from '@/data/explore';

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

    switch (result.type) {
      case 'country':
        router.push(`/(tabs)/explore/country/${result.slug}`);
        break;
      case 'city':
        router.push(`/(tabs)/explore/city/${result.slug}`);
        break;
      case 'place':
        router.push(`/(tabs)/explore/activity/${result.slug}`);
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
        <Pressable onPress={handleBack} hitSlop={12}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.inputContainer}>
          <Feather name="search" size={18} color={colors.textMuted} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Search countries, cities, or activities"
            placeholderTextColor={colors.textMuted}
            returnKeyType="search"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={handleClear} hitSlop={8}>
              <Feather name="x" size={18} color={colors.textMuted} />
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
        // Recent searches
        recentSearches.length > 0 && (
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
        )
      ) : results.length === 0 ? (
        // No results
        <View style={styles.centered}>
          <Text style={styles.noResults}>No results for "{query}"</Text>
          <Text style={styles.noResultsHint}>
            Try searching for a country or city name.
          </Text>
        </View>
      ) : (
        // Results
        <FlatList
          data={results}
          renderItem={renderResult}
          keyExtractor={(item) => `${item.type}-${item.id}`}
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
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
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
});
