import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Sentry from '@sentry/react-native';
import NavigationHeader from '@/components/NavigationHeader';
import { colors, fonts, spacing, radius, pressedState } from '@/constants/design';
import { getAllVolunteers } from '@/data/api';
import type { VolunteerWithLocation } from '@/data/api';

// ---------------------------------------------------------------------------
// Filter options
// ---------------------------------------------------------------------------

const TYPE_OPTIONS = [
  { key: 'all', label: 'All types' },
  { key: 'animal', label: 'Animal rescue' },
  { key: 'teaching', label: 'Teaching' },
  { key: 'conservation', label: 'Conservation' },
  { key: 'community', label: 'Community' },
  { key: 'farming', label: 'Farming' },
  { key: 'healthcare', label: 'Healthcare' },
];

// ---------------------------------------------------------------------------
// FilterSheet — reusable picker sheet
// ---------------------------------------------------------------------------

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: { key: string; label: string }[];
  selected: string;
  onSelect: (key: string) => void;
}

function FilterSheet({ visible, onClose, title, options, selected, onSelect }: FilterSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={sheetStyles.overlay}>
        <Pressable style={sheetStyles.backdrop} onPress={onClose} />
        <View style={[sheetStyles.container, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={sheetStyles.handle} />
          <Text style={sheetStyles.title}>{title}</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={sheetStyles.list}>
            {options.map((opt) => {
              const isSelected = opt.key === selected;
              return (
                <Pressable
                  key={opt.key}
                  style={[sheetStyles.row, isSelected && sheetStyles.rowSelected]}
                  onPress={() => {
                    onSelect(opt.key);
                    onClose();
                  }}
                >
                  <Text style={[sheetStyles.rowText, isSelected && sheetStyles.rowTextSelected]}>
                    {opt.label}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.orange} />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const sheetStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: spacing.xl,
    borderTopRightRadius: spacing.xl,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.screenX,
    maxHeight: '60%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderDefault,
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: fonts.semiBold,
    fontSize: 18,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  list: {
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  rowSelected: {
    backgroundColor: colors.orangeFill,
    borderRadius: radius.card,
    borderBottomColor: 'transparent',
  },
  rowText: {
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textPrimary,
  },
  rowTextSelected: {
    color: colors.orange,
  },
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function VolunteerListingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [volunteers, setVolunteers] = useState<VolunteerWithLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');
  const [activeCountry, setActiveCountry] = useState('all');
  const [showTypeSheet, setShowTypeSheet] = useState(false);
  const [showCountrySheet, setShowCountrySheet] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getAllVolunteers(200);
        setVolunteers(data);
      } catch (err) {
        Sentry.captureException(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Derive unique countries from data
  const countryOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const v of volunteers) {
      if (v.countryId && v.countryName && !seen.has(v.countryId)) {
        seen.set(v.countryId, v.countryName);
      }
    }
    const sorted = Array.from(seen.entries()).sort((a, b) => a[1].localeCompare(b[1]));
    return [{ key: 'all', label: 'All countries' }, ...sorted.map(([key, label]) => ({ key, label }))];
  }, [volunteers]);

  const filtered = useMemo(() => {
    return volunteers.filter((v) => {
      if (activeType !== 'all' && v.volunteerType !== activeType) return false;
      if (activeCountry !== 'all' && v.countryId !== activeCountry) return false;
      return true;
    });
  }, [volunteers, activeType, activeCountry]);

  // Current label for dropdown buttons
  const countryLabel = countryOptions.find((o) => o.key === activeCountry)?.label ?? 'All countries';
  const typeLabel = TYPE_OPTIONS.find((o) => o.key === activeType)?.label ?? 'All types';

  const hasFilters = activeType !== 'all' || activeCountry !== 'all';

  const renderItem = useCallback(
    ({ item }: { item: VolunteerWithLocation }) => (
      <Pressable
        style={({ pressed }) => [styles.listItem, pressed && styles.listItemPressed]}
        onPress={() => router.push(`/discover/place-detail/${item.id}`)}
      >
        <View style={styles.listImageContainer}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.listImage}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.listImage, styles.listImagePlaceholder]}>
              <Ionicons name="heart-outline" size={24} color={colors.textMuted} />
            </View>
          )}
        </View>
        <View style={styles.listContent}>
          <Text style={styles.listTitle} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.listLocation}>{item.cityName}, {item.countryName}</Text>
          <View style={styles.listMeta}>
            {item.volunteerType && (
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>
                  {item.volunteerType.charAt(0).toUpperCase() + item.volunteerType.slice(1)}
                </Text>
              </View>
            )}
            {item.minCommitment && (
              <Text style={styles.listCommitment}>Min. {item.minCommitment}</Text>
            )}
          </View>
        </View>
      </Pressable>
    ),
    [router],
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <NavigationHeader title="Volunteer" parentTitle="Discover" />

      {/* Filter bar — two dropdown buttons */}
      <View style={styles.filterBar}>
        <Pressable
          style={[styles.dropdown, activeCountry !== 'all' && styles.dropdownActive]}
          onPress={() => setShowCountrySheet(true)}
        >
          <Text
            style={[styles.dropdownText, activeCountry !== 'all' && styles.dropdownTextActive]}
            numberOfLines={1}
          >
            {countryLabel}
          </Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color={activeCountry !== 'all' ? colors.orange : colors.textMuted}
          />
        </Pressable>

        <Pressable
          style={[styles.dropdown, activeType !== 'all' && styles.dropdownActive]}
          onPress={() => setShowTypeSheet(true)}
        >
          <Text
            style={[styles.dropdownText, activeType !== 'all' && styles.dropdownTextActive]}
            numberOfLines={1}
          >
            {typeLabel}
          </Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color={activeType !== 'all' ? colors.orange : colors.textMuted}
          />
        </Pressable>

        {hasFilters && (
          <Pressable
            style={styles.clearBtn}
            onPress={() => { setActiveType('all'); setActiveCountry('all'); }}
            hitSlop={8}
          >
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Results count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {loading ? 'Loading...' : `${filtered.length} organization${filtered.length !== 1 ? 's' : ''}`}
        </Text>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="small" color={colors.orange} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No volunteer opportunities found</Text>
              <Pressable
                style={styles.clearFilterBtn}
                onPress={() => { setActiveType('all'); setActiveCountry('all'); }}
              >
                <Text style={styles.clearFilterText}>Clear filters</Text>
              </Pressable>
            </View>
          }
        />
      )}

      {/* Selection sheets */}
      <FilterSheet
        visible={showCountrySheet}
        onClose={() => setShowCountrySheet(false)}
        title="Country"
        options={countryOptions}
        selected={activeCountry}
        onSelect={setActiveCountry}
      />
      <FilterSheet
        visible={showTypeSheet}
        onClose={() => setShowTypeSheet(false)}
        title="Type"
        options={TYPE_OPTIONS}
        selected={activeType}
        onSelect={setActiveType}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderDefault,
  },
  dropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.neutralFill,
    borderRadius: radius.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  dropdownActive: {
    backgroundColor: colors.orangeFill,
  },
  dropdownText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  dropdownTextActive: {
    color: colors.orange,
  },
  clearBtn: {
    padding: spacing.xs,
  },
  countRow: {
    paddingHorizontal: spacing.screenX,
    paddingVertical: spacing.md,
  },
  countText: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: colors.textMuted,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: spacing.screenX,
    paddingBottom: spacing.xxxxl,
    gap: spacing.xl,
  },
  listItem: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  listItemPressed: {
    opacity: pressedState.opacity,
  },
  listImageContainer: {
    width: 100,
    height: 100,
    borderRadius: radius.card,
    overflow: 'hidden',
    backgroundColor: colors.neutralFill,
  },
  listImage: {
    width: 100,
    height: 100,
  },
  listImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
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
  listLocation: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  typeBadge: {
    backgroundColor: colors.orangeFill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  typeBadgeText: {
    fontFamily: fonts.medium,
    fontSize: 11,
    color: colors.orange,
  },
  listCommitment: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.lg,
  },
  emptyText: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.textMuted,
  },
  clearFilterBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.neutralFill,
  },
  clearFilterText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.textPrimary,
  },
});
