import { useState, useCallback, useMemo } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, spacing } from '@/constants/design';
import { searchMockData, MockCountry, MockCity, MockActivity } from '@/data/exploreMockData';

type SearchResult =
  | { type: 'country'; item: MockCountry }
  | { type: 'city'; item: MockCity }
  | { type: 'activity'; item: MockActivity };

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ segment?: string }>();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const { countries, cities, activities } = searchMockData(query);
    const all: SearchResult[] = [];
    const segment = params.segment;

    // Filter based on active segment if provided
    if (!segment || segment === 'countries') {
      countries.forEach(item => all.push({ type: 'country', item }));
    }
    if (!segment || segment === 'places') {
      cities.forEach(item => all.push({ type: 'city', item }));
    }
    if (!segment || segment === 'activities') {
      activities.forEach(item => all.push({ type: 'activity', item }));
    }

    return all;
  }, [query, params.segment]);

  const handleResultPress = useCallback((result: SearchResult) => {
    switch (result.type) {
      case 'country':
        router.push(`/(tabs)/explore/country/${result.item.slug}` as any);
        break;
      case 'city':
        router.push(`/(tabs)/explore/city/${result.item.slug}` as any);
        break;
      case 'activity':
        router.push(`/(tabs)/explore/activity/${result.item.slug}` as any);
        break;
    }
  }, [router]);

  const getPlaceholder = () => {
    switch (params.segment) {
      case 'countries': return 'Search countries...';
      case 'places': return 'Search cities...';
      case 'activities': return 'Search activities...';
      default: return 'Search destinations...';
    }
  };

  const renderItem = useCallback(({ item }: { item: SearchResult }) => {
    let imageUrl = '';
    let title = '';
    let subtitle = '';
    let icon: 'flag' | 'location' | 'compass' = 'location';

    switch (item.type) {
      case 'country':
        imageUrl = item.item.heroImageUrl;
        title = item.item.name;
        subtitle = item.item.subtitle;
        icon = 'flag';
        break;
      case 'city':
        imageUrl = item.item.heroImageUrl;
        title = item.item.name;
        subtitle = item.item.countryName;
        icon = 'location';
        break;
      case 'activity':
        imageUrl = item.item.heroImageUrl;
        title = item.item.name;
        subtitle = `${item.item.cityName}, ${item.item.countryName}`;
        icon = 'compass';
        break;
    }

    return (
      <Pressable
        style={styles.resultItem}
        onPress={() => handleResultPress(item)}
      >
        <Image source={{ uri: imageUrl }} style={styles.resultImage} contentFit="cover" />
        <View style={styles.resultText}>
          <Text style={styles.resultTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.resultSubtitle} numberOfLines={1}>{subtitle}</Text>
        </View>
        <View style={styles.resultIconContainer}>
          <Ionicons name={icon} size={16} color={colors.textSecondary} />
        </View>
      </Pressable>
    );
  }, [handleResultPress]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Search Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder={getPlaceholder()}
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Results */}
      {query.length > 0 ? (
        results.length > 0 ? (
          <FlatList
            data={results}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.type}-${item.item.id}`}
            contentContainerStyle={styles.resultsList}
            keyboardShouldPersistTaps="handled"
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No results for "{query}"</Text>
          </View>
        )
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Start typing to search</Text>
        </View>
      )}
    </KeyboardAvoidingView>
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
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  resultsList: {
    paddingVertical: spacing.sm,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  resultImage: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
  },
  resultText: {
    flex: 1,
  },
  resultTitle: {
    fontFamily: fonts.medium,
    fontSize: 15,
    color: colors.textPrimary,
  },
  resultSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  resultIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutralFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 100,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
});
