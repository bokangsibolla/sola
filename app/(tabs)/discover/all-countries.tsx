// app/(tabs)/discover/all-countries.tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NavigationHeader from '@/components/NavigationHeader';
import * as Sentry from '@sentry/react-native';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { getCountries } from '@/data/api';
import type { Country } from '@/data/types';

export default function AllCountriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const allCountries = await getCountries();
        setCountries(allCountries);
      } catch (err) {
        Sentry.captureException(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return countries;
    const q = search.toLowerCase();
    return countries.filter((c) => c.name.toLowerCase().includes(q));
  }, [countries, search]);

  const renderCountry = useCallback(({ item }: { item: Country }) => (
    <Pressable
      style={styles.listItem}
      onPress={() => router.push(`/discover/country/${item.slug}`)}
    >
      <Image
        source={{ uri: item.heroImageUrl ?? undefined }}
        style={styles.listImage}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.listContent}>
        <Text style={styles.listTitle}>{item.name}</Text>
        {item.shortBlurb && (
          <Text style={styles.listSubtitle} numberOfLines={2}>
            {item.shortBlurb}
          </Text>
        )}
        {item.soloLevel && (
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>
              {item.soloLevel.charAt(0).toUpperCase() + item.soloLevel.slice(1)}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  ), [router]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <NavigationHeader title="All Countries" parentTitle="Discover" backHref="/(tabs)/discover" />

      {/* Search */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search countries"
          placeholderTextColor={colors.textMuted}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Feather name="x" size={16} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        renderItem={renderCountry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No countries found</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.screenX,
    backgroundColor: colors.neutralFill,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
    paddingVertical: spacing.xs,
  },
  list: {
    padding: spacing.screenX,
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  listItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  listImage: {
    width: 100,
    height: 100,
    borderRadius: radius.card,
    backgroundColor: colors.neutralFill,
  },
  listContent: {
    flex: 1,
    justifyContent: 'center',
  },
  listTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  listSubtitle: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.neutralFill,
  },
  levelText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.textSecondary,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
});
