// app/(tabs)/discover/all-activities.tsx
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import NavigationHeader from '@/components/NavigationHeader';
import * as Sentry from '@sentry/react-native';
import { colors, fonts, spacing, radius } from '@/constants/design';
import { getAllActivities, getCityById, getCountryById } from '@/data/api';
import type { Place } from '@/data/types';

interface ActivityRow extends Place {
  cityName: string;
  countryName: string;
  countryId: string;
  imageUrl: string | null;
}

interface FilterOption {
  id: string;
  name: string;
}

// ---------------------------------------------------------------------------
// Dropdown Picker
// ---------------------------------------------------------------------------
function DropdownPicker({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: string | null;
  options: FilterOption[];
  onSelect: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);

  return (
    <>
      <Pressable
        style={styles.dropdown}
        onPress={() => setOpen(true)}
      >
        <Text
          style={[
            styles.dropdownText,
            selected && styles.dropdownTextSelected,
          ]}
          numberOfLines={1}
        >
          {selected ? selected.name : label}
        </Text>
        <Feather
          name="chevron-down"
          size={16}
          color={selected ? colors.textPrimary : colors.textMuted}
        />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setOpen(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{label}</Text>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* "All" option */}
              <Pressable
                style={[
                  styles.modalOption,
                  !value && styles.modalOptionActive,
                ]}
                onPress={() => {
                  onSelect(null);
                  setOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    !value && styles.modalOptionTextActive,
                  ]}
                >
                  {label}
                </Text>
                {!value && (
                  <Feather name="check" size={16} color={colors.orange} />
                )}
              </Pressable>

              {options.map((option) => (
                <Pressable
                  key={option.id}
                  style={[
                    styles.modalOption,
                    value === option.id && styles.modalOptionActive,
                  ]}
                  onPress={() => {
                    onSelect(option.id);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      value === option.id && styles.modalOptionTextActive,
                    ]}
                  >
                    {option.name}
                  </Text>
                  {value === option.id && (
                    <Feather name="check" size={16} color={colors.orange} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

// ---------------------------------------------------------------------------
// Main Screen
// ---------------------------------------------------------------------------
export default function AllActivitiesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCountry, setActiveCountry] = useState<string | null>(null);
  const [activeCity, setActiveCity] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const allActivities = await getAllActivities(100);

        // Resolve unique cities
        const cityIds = Array.from(
          new Set(allActivities.map((a) => a.cityId))
        );
        const cityResults = await Promise.all(
          cityIds.map((id) => getCityById(id))
        );
        const cityMap = new Map(
          cityResults.filter(Boolean).map((c) => [c!.id, c!])
        );

        // Resolve unique countries from cities
        const countryIds = Array.from(
          new Set(cityResults.filter(Boolean).map((c) => c!.countryId))
        );
        const countryResults = await Promise.all(
          countryIds.map((id) => getCountryById(id))
        );
        const countryMap = new Map(
          countryResults.filter(Boolean).map((c) => [c!.id, c!.name])
        );

        setActivities(
          allActivities.map((activity) => {
            const city = cityMap.get(activity.cityId);
            return {
              ...activity,
              cityName: city?.name ?? '',
              countryName: city ? (countryMap.get(city.countryId) ?? '') : '',
              countryId: city?.countryId ?? '',
              imageUrl: activity.imageUrl ?? null,
            };
          })
        );
      } catch (err) {
        Sentry.captureException(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Derive filter options from loaded data
  const countryOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of activities) {
      if (a.countryId && a.countryName) {
        map.set(a.countryId, a.countryName);
      }
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [activities]);

  const cityOptions = useMemo(() => {
    const map = new Map<string, string>();
    const source = activeCountry
      ? activities.filter((a) => a.countryId === activeCountry)
      : activities;
    for (const a of source) {
      if (a.cityId && a.cityName) {
        map.set(a.cityId, a.cityName);
      }
    }
    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [activities, activeCountry]);

  // Reset city filter when country changes
  useEffect(() => {
    setActiveCity(null);
  }, [activeCountry]);

  const filtered = useMemo(() => {
    let list = activities;
    if (activeCountry) {
      list = list.filter((a) => a.countryId === activeCountry);
    }
    if (activeCity) {
      list = list.filter((a) => a.cityId === activeCity);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.cityName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activities, activeCountry, activeCity, search]);

  const renderActivity = useCallback(
    ({ item }: { item: ActivityRow }) => (
      <Pressable
        style={styles.listItem}
        onPress={() => router.push(`/discover/activity/${item.slug}`)}
      >
        <View style={styles.listImageContainer}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.listImage}
              contentFit="cover"
              transition={200}
            />
          ) : null}
          {item.highlights && item.highlights.length > 0 && (
            <View style={styles.highlightBadge}>
              <Text style={styles.highlightText} numberOfLines={1}>
                {item.highlights[0]}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.listContent}>
          <Text style={styles.listTitle} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.listSubtitle}>
            {item.cityName}{item.countryName ? `, ${item.countryName}` : ''}
          </Text>
          {item.placeType && (
            <Text style={styles.listType}>
              {item.placeType.charAt(0).toUpperCase() + item.placeType.slice(1)}
            </Text>
          )}
          {item.estimatedDuration && (
            <Text style={styles.listDuration}>{item.estimatedDuration}</Text>
          )}
        </View>
      </Pressable>
    ),
    [router]
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <NavigationHeader title="All Activities" parentTitle="Discover" backHref="/(tabs)/discover" />

      {/* Search */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search activities"
          placeholderTextColor={colors.textMuted}
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Feather name="x" size={16} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Dropdowns */}
      <View style={styles.dropdownRow}>
        <View style={styles.dropdownHalf}>
          <DropdownPicker
            label="All Countries"
            value={activeCountry}
            options={countryOptions}
            onSelect={setActiveCountry}
          />
        </View>
        <View style={styles.dropdownHalf}>
          <DropdownPicker
            label="All Cities"
            value={activeCity}
            options={cityOptions}
            onSelect={setActiveCity}
          />
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        renderItem={renderActivity}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No activities found</Text>
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
  // Dropdown row
  dropdownRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.screenX,
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  dropdownHalf: {
    flex: 1,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.card,
    borderWidth: 1,
    borderColor: colors.borderDefault,
    backgroundColor: colors.background,
  },
  dropdownText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textMuted,
  },
  dropdownTextSelected: {
    fontFamily: fonts.medium,
    color: colors.textPrimary,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: radius.module,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    maxHeight: 400,
  },
  modalTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 17,
    color: colors.textPrimary,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  modalScroll: {
    paddingHorizontal: spacing.sm,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.card,
  },
  modalOptionActive: {
    backgroundColor: colors.orangeFill,
  },
  modalOptionText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  modalOptionTextActive: {
    fontFamily: fonts.medium,
    color: colors.orange,
  },
  // List
  list: {
    padding: spacing.screenX,
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  listItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  listImageContainer: {
    width: 100,
    height: 100,
    borderRadius: radius.card,
    backgroundColor: colors.neutralFill,
    overflow: 'hidden',
  },
  listImage: {
    width: 100,
    height: 100,
  },
  highlightBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  highlightText: {
    fontFamily: fonts.medium,
    fontSize: 10,
    color: '#FFFFFF',
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
  listType: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  listDuration: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
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
