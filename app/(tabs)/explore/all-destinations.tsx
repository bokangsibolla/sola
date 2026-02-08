// app/(tabs)/explore/all-destinations.tsx
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
import ScreenHeader from '@/components/ui/ScreenHeader';
import * as Sentry from '@sentry/react-native';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { getAllCities, getCountryById } from '@/data/api';
import type { City } from '@/data/types';

interface CityRow extends City {
  countryName: string;
}

export default function AllDestinationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [cities, setCities] = useState<CityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const allCities = await getAllCities();
        const countryIds = allCities.map((c) => c.countryId).filter((v, i, arr) => arr.indexOf(v) === i);
        const countryResults = await Promise.all(
          countryIds.map((id) => getCountryById(id))
        );
        const countryMap = new Map(
          countryResults.filter(Boolean).map((c) => [c!.id, c!.name])
        );

        setCities(
          allCities.map((city) => ({
            ...city,
            countryName: countryMap.get(city.countryId) ?? '',
          }))
        );
      } catch (err) {
        Sentry.captureException(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return cities;
    const q = search.toLowerCase();
    return cities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.countryName.toLowerCase().includes(q)
    );
  }, [cities, search]);

  const renderCity = useCallback(
    ({ item }: { item: CityRow }) => (
      <Pressable
        style={styles.listItem}
        onPress={() => router.push(`/explore/city/${item.slug}`)}
      >
        <Image
          source={{ uri: item.heroImageUrl ?? undefined }}
          style={styles.listImage}
          contentFit="cover"
          transition={200}
        />
        <View style={styles.listContent}>
          <Text style={styles.listTitle}>{item.name}</Text>
          <Text style={styles.listSubtitle}>{item.countryName}</Text>
          {item.shortBlurb && (
            <Text style={styles.listBlurb} numberOfLines={2}>
              {item.shortBlurb}
            </Text>
          )}
        </View>
      </Pressable>
    ),
    [router]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={{ paddingHorizontal: spacing.screenX }}>
        <ScreenHeader title="All Destinations" />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search destinations"
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
        renderItem={renderCity}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No destinations found</Text>
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
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listBlurb: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: spacing.xs,
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
